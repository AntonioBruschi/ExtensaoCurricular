const { Client } = require("pg");
const express = require("express");
const fs = require('fs');
const cors = require("cors");
const path = require('path')
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads')) // Onde os arquivos serão salvos
    },
    filename: function (req, file, cb) {
        // Gerando um nome de arquivo único com a extensão original
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });


//npm run dev para iniciar o servidor

const app = express();
const port = 3000;
app.use(cors());

app.use(express.static(__dirname + '/../public'));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurações da conexão
const client = new Client({
	user: "postgres",
	host: "localhost",
	database: "postgres",
	password: "pgadim",
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

app.post("/doar", upload.single('fotoLivro'), async (req, res) => {
	const { nome, autor, localizacao, doador, contato } = req.body;
	const fotoLivro = 'uploads/' + req.file.filename; // Modifique aqui para armazenar caminho relativo

	try {
		const query = {
			text: "INSERT INTO livros(nome_do_livro, autor, localizacao, doador, contato, foto) VALUES($1, $2, $3, $4, $5, $6)",
			values: [nome, autor, localizacao, doador, contato, fotoLivro],
		};
		await client.query(query);
		console.log("Dados inseridos com sucesso no banco de dados!");
		res.redirect("/doar.html"); 
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
	const numeroAcessosvelho = await getAcessos();
	const numeroAcesso = parseInt(numeroAcessosvelho, 10) + 1
	// console.log(numeroAcessosvelho)
	if(!numeroAcessosvelho){
		inserirAcesso();
	} else {
		updateAcessos(numeroAcesso);
	}

	res.sendFile(caminhoIndex)
})
// app.get("/index.html", async (req, res) =>{
// 	const numeroAcessosvelho = await getAcessos();
// 	const numeroAcesso = parseInt(numeroAcessosvelho, 10) + 1
// 	console.log(numeroAcessosvelho)
// 	if(!numeroAcessosvelho){
// 		inserirAcesso();
// 	} else {
// 		updateAcessos(numeroAcesso);
// 	}

// 	res.sendFile(caminhoIndex)
// })

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
        // Primeiro, recuperar o caminho do arquivo
        const querySelect = {
            text: "SELECT foto FROM livros WHERE id = $1",
            values: [idLivro],
        };
        const result = await client.query(querySelect);
        
        if (result.rows.length > 0) {
            const fotoPath = result.rows[0].foto;

            // Apagar o arquivo do sistema de arquivos
            const fullPath = path.join(__dirname, '..', 'public', fotoPath);
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error("Erro ao deletar o arquivo:", err);
                } else {
                    console.log("Arquivo deletado com sucesso!");
                }
            });

            // Depois, deletar o registro do banco de dados
            const queryDelete = {
                text: "DELETE FROM livros WHERE id = $1",
                values: [idLivro],
            };
            await client.query(queryDelete);
            res.send("Livro retirado com sucesso!");
        } else {
            res.status(404).send("Livro não encontrado!");
        }
    } catch (err) {
        console.error("Erro ao deletar livro:", err);
        res.status(500).send("Erro ao tentar deletar o livro.");
    }
});

app.get('/get-acessos', async (req, res) => {
    try {
        const acessos = await getAcessos();
        res.json({ acessos });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar dados de acesso' });
    }
});


async function getAcessos(){
	try {
		const query = "SELECT * FROM acessos ORDER BY numero_acessos DESC LIMIT 1";
		const result = await client.query(query);

		if (result.rows.length === 0){
			return false;
		} else {
			console.log(result.rows[0].numero_acessos)
			return result.rows[0].numero_acessos; // Envie apenas os resultados da consulta
		}

	} catch (err) {
		console.error("Erro ao buscar dados no banco de dados:", err);
		return "Erro ao buscar dados no banco de dados!";
	}
};

async function updateAcessos(nAcessos){
	try {
		const query = {
			text: "UPDATE acessos SET numero_acessos = $1",
			values: [nAcessos]
		};
		const result = await client.query(query);
		return result.rowCount; // Retorna o número de linhas afetadas
	} catch (err) {
		console.error("Erro ao buscar dados no banco de dados:", err);
		return "Erro ao buscar dados no banco de dados!";
	}
}

async function inserirAcesso(){
	try {
		const query = "INSERT INTO acessos(numero_acessos) VALUES (1)";
		const result = await client.query(query);
		return result.rowCount; // Retorna o número de linhas inseridas
	} catch (err) {
		console.error("Erro ao buscar dados no banco de dados:", err);
		return "Erro ao buscar dados no banco de dados!";
	}
}
