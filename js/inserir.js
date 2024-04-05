const { Client } = require("pg");
const express = require("express");
const cors = require("cors");
const path = require('path')

//npm run dev para iniciar o servidor

const app = express();
const port = 3000;
app.use(cors());

app.use(express.static(__dirname + '/../public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurações da conexão
const client = new Client({
	user: "postgres",
	host: "localhost",
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

	
	// Middleware para servir arquivos estáticos, incluindo CSS

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

const caminhoIndex = path.join(__dirname, "..", 'index.html')
const caminhoDoar = path.join(__dirname, "..", 'doar.html')
const caminhoHst = path.join(__dirname, "..", 'hst.html')
const caminhoEnv = path.join(__dirname, "..", 'env.html')

app.get("/", async (req, res) =>{
	res.sendFile(caminhoIndex)
})
app.get("/index.html", async (req, res) =>{
	res.sendFile(caminhoIndex)
})

app.get("/doar.html", async (req, res) =>{
	res.sendFile(caminhoDoar)
})

app.get("/hst.html", async (req, res) =>{
	res.sendFile(caminhoHst)
})

app.get("/env.html", async (req, res) =>{
	res.sendFile(caminhoEnv)
})

app.get("/doar", async (req, res) => {
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

app.delete("/doar/:idLivro", async (req, res) => {
	const { idLivro } = req.params;
	try {
	  const query = {
		text: "DELETE FROM livros WHERE id = $1",
		values: [idLivro],
	  };
  
	  await client.query(query);
	  res.send("Livro retirado com sucesso!");
	} catch (err) {
	  console.error("Erro ao deletar livro:", err);
	  res.status(500).send("Erro ao tentar deletar o livro.");
	}
});