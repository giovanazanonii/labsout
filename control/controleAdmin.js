const express = require("express");
const router = express.Router();
const conexao = require('../banco/conexao');

//middlewares no router
router.use(express.json());
router.use(express.static('public'));
router.use(express.urlencoded({ extended: true }));

//rotas
router.get("/inicialadmin",(req,res)=>{
    res.render("pages/inicialadmin")
})
router.get("/usuarios",(req,res)=>{
    res.render("pages/usuarios")
})
router.get("/reservas",(req,res)=>{
    res.render("pages/reservas")
})
router.get("/cadastroambiente",(req,res)=>{
    res.render("pages/cadastroambiente")
})
router.get("/cadastrarusuario",(req,res)=>{
    res.render("pages/cadastrarusuario")
})
//cadastrando ambientes
router.post('/cadastroambiente', (req, res) => {
    const nomeAmbiente = req.body.nomeambiente;
    const capacidade = req.body.capacidade;
    const localizacao = req.body.localizacao;
    const tipo = req.body.tipo;

    const consulta = 'INSERT INTO ambientes (nome_ambiente, capacidade_ambiente, localizacao_ambiente, id_tipo_ambiente) VALUES (?, ?, ?, ?)';

    conexao.query(consulta, [nomeAmbiente, capacidade, localizacao, tipo], function (err) {
        if (err) {
            return res.redirect('/cadastroambiente?message=Erro ao cadastrar ambiente.&type=danger');
        } else {
            res.redirect('/cadastroambiente?message=Ambiente cadastrado com sucesso!&type=success');
        }
    });
});

// visualizar laboratorios
router.get("/laboratorios", (req, res) => {
    const consulta = "SELECT * FROM ambientes";

    conexao.query(consulta, (error, results) => {
        if (error) {
            return res.status(500).send("Erro ao buscar os ambientes no banco de dados.");
        }
        res.render("pages/laboratorios", { ambientes: results });
    });
});
router.get('/deletarambiente/:id', (req, res) => {
    const idAmbiente = req.params.id;

    const consulta = 'DELETE FROM ambientes WHERE id_ambiente = ?';

    conexao.query(consulta, [idAmbiente], (err) => {
        if (err) {
            return res.redirect('/laboratorios?message=Erro ao deletar o ambiente.&type=danger');
        }
        res.redirect('/laboratorios?message=Ambiente deletado com sucesso!&type=success');
    });
});


//cadastrando usuarios
router.post('/cadastrarusuario', (req, res) => {
    const nome = req.body.nome;
    const senha = req.body.senha;
    const cpf = req.body.cpf.replace(/\D/g, '');;
    let tipo = req.body.tipo;

    if (tipo.toLowerCase() === "usuario") {
        tipo = 1;
    } else if (tipo.toLowerCase() === "admin") {
        tipo = 2;
    } else {
        return res.redirect('/cadastrarusuario?message=Tipo de usuário inválido. Use "usuario" ou "admin".&type=danger');
    }

    const consulta = 'INSERT INTO usuario (nome_usuario, senha_usuario, cpf_usuario, tipo_usuario) VALUES (?, ?, ?, ?)';
  
    conexao.query(consulta, [nome, senha, cpf, tipo], function (err) {
      if (err) {
        return res.redirect('/cadastrarusuario?message=Erro ao cadastrar usuário.&type=danger');
      } else {
        res.redirect('/cadastrarusuario?message=Usuário cadastrado com sucesso!&type=success');
      }
    });
    
});
//visualizar todos os usuarios - admin
router.get('/usuarios/listar', (req, res) => {
    conexao.query('SELECT nome_usuario AS nome, senha_usuario AS senha, cpf_usuario AS cpf, tipo_usuario AS tipo FROM usuario', (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        }
        const resultadoTipo = results.map(usuario => ({
            ...usuario,
            tipo: usuario.tipo === 1 ? 'Normal' : 'Administrador'
        }));

        res.json(resultadoTipo);
    });
});
//deletar usuarios
router.delete('/usuarios/deletar/:id', (req, res) => {
    const usuarioId = req.params.id;
    const consulta = 'DELETE FROM usuario WHERE cpf_usuario = ?';
  
    conexao.query(consulta, [usuarioId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao excluir o usuário.' });
        }
        res.status(200).json({ message: 'Usuário excluído com sucesso.' });
    });
});


module.exports = router;