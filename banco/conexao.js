const mysql = require('mysql2');

/* (CONEXAO FUNCIONANDO)*/
const connection = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: '',
    database: 'labsout'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados: ' + err.stack);
        return;
    }
    console.log('Conectado ao banco de dados');
});

module.exports = connection;
