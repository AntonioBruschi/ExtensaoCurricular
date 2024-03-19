const { Client } = require("pg");

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

    export default client; // Exporta o cliente para ser utilizado em outros arquivos