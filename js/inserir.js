const { Client } = require("pg");
const express = require('express');


const app = express();
const port = 3000;


// Configurações da conexão
const client = new Client({
	user: "postgres",
	host: "localhost",
	database: "postgres",
	password: "pgadmin",
	port: 5432,
});

// Conectar ao banco de dados
client
	.connect()
	.then(() => console.log("Conexão bem-sucedida!"))
	.catch((err) => console.error("Erro ao conectar:", err))
	.finally(() => client.end());

client.connect()
  .then(() => console.log('Conexão com o banco de dados PostgreSQL estabelecida!'))
  .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/doar', async (req, res) => {
  const { nome, Autor, localizacao, doador, contato } = req.body;

  try {
    const query = {
      text: 'INSERT INTO livros(nome_do_livro, autor, localizacao, doador, contato) VALUES($1, $2, $3, $4, $5)',
      values: [nome, Autor, localizacao, doador, contato],
    };

    await client.query(query);
    console.log('Dados inseridos com sucesso no banco de dados!');
    res.send('Dados inseridos com sucesso!');
  } catch (err) {
    console.error('Erro ao inserir dados no banco de dados:', err);
    res.status(500).send('Erro ao inserir dados no banco de dados!');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
