const { Client } = require("pg");
const express = require("express");
const cors = require("cors");

//npm run dev para iniciar o servidor

const app = express();
const port = 3000;
app.use(cors());

// Configurações da conexão
const client = new Client({
	user: "postgres",
	host: "127.0.0.1",
	database: "PontesDePapel",
	password: "Toni2611",
	port: 5432,
});

// Conectar ao banco de dados
client
	.connect()
	.then(() => {
		console.log("Conexão com o banco de dados estabelecida");
		app.listen(port, () => {
			console.log(`Servidor rodando em http://localhost:${port}`);
		});
	})
	.catch((err) => {
		console.error("Erro ao conectar ao banco de dados:", err);
	});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/doar", async (req, res) => {
	const { nome, autor, localizacao, doador, contato } = req.body;

	try {
		const query = {
			text: "INSERT INTO livros(nome_do_livro, autor, localizacao, doador, contato) VALUES($1, $2, $3, $4, $5)",
			values: [nome, autor, localizacao, doador, contato],
		};

		await client.query(query);
		console.log("Dados inseridos com sucesso no banco de dados!");
		
		res.send("Dados inseridos com sucesso!");
	} catch (err) {
		console.error("Erro ao inserir dados no banco de dados:", err);
		res.status(500).send("Erro ao inserir dados no banco de dados!");
	}
});

app.get("/doacoes", async (req, res) => {
	try {
		const query = "SELECT * FROM livros";
		const result = await client.query(query);
		// console.log(result.rows)
		res.send(result.rows); // Envie apenas os resultados da consulta
	} catch (err) {
		console.error("Erro ao buscar dados no banco de dados:", err);
		res.status(500).send("Erro ao buscar dados no banco de dados!");
	}
});

app.delete("/doacoes/:nomeLivro", async (req, res) => {
	const nomeLivro = req.params.nomeLivro;
	const id = await VerificaId(nomeLivro);
	try {
		console.log(id);
		const query = {
			text: "DELETE FROM livros WHERE id = $1",
			values: [id],
		};

		await client.query(query);
		res.send("Dados deletados com sucesso!");
	} catch (err) {
		console.error("Erro ao deletar dados no banco de dados:", err);
		res.status(500).send("Erro ao deletar dados no banco de dados!");
	}
});

async function VerificaId(nomeLivro) {
	const query1 = {
		text: "SELECT id FROM livros WHERE nome_do_livro = $1",
		values: [nomeLivro],
	};

	console.log(query1);

	try {
		const result = await client.query(query1);
		console.log("Id do Livro: " + result.rows[0].id); // Acessa o id do primeiro resultado (assumindo que apenas um livro é retornado)
		return result.rows[0].id;
	} catch (error) {
		console.error("Erro ao executar a consulta:", error);
		return null; // Retorna null em caso de erro
	}
}

app.delete("/doacoes/:idDoLivro", async (req, res) => {
    const idDoLivro = parseInt(req.params.idDoLivro, 10);
    try {
        const query = {
            text: "DELETE FROM livros WHERE id = $1",
            values: [idDoLivro],
        };
        const result = await client.query(query);
        if (result.rowCount > 0) {
            console.log("Livro removido com sucesso.");
            res.send("Livro removido com sucesso.");
        } else {
            console.log("Livro não encontrado.");
            res.status(404).send("Livro não encontrado.");
        }
    } catch (err) {
        console.error("Erro ao deletar dados no banco de dados:", err);
        res.status(500).send("Erro ao deletar dados no banco de dados.");
    }
});

