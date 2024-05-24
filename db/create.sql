CREATE TABLE livros (
    id SERIAL PRIMARY KEY,
    nome_do_livro VARCHAR(255),
    autor VARCHAR(255),
    localizacao VARCHAR(50),
    doador VARCHAR(100),
    contato VARCHAR(100);
);

CREATE TABLE acessos (
    numero_acessos int;
)
