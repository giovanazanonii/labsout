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
router.get("/laboratorios",(req,res)=>{
    res.render("pages/laboratorios")
})
// rota para logout 
router.post('/logout', (req, res) => {
    //  encerrar o login do usuário e remover todos os dados de sessão associados.
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao finalizar a sessão.' });
        }
        res.status(200).json({ message: 'Logout realizado com sucesso.' });
    });
});

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

// visualizar todos os ambientes - admin
router.get('/laboratorios/listar', (req, res) => {
    conexao.query('SELECT * FROM ambientes', (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        }
        const tipoLab = {
            1: 'Administração',
            2: 'Biologia',
            3: 'Edificações',
            4: 'Informática',
            5: 'Química',
            6: 'Outros'
        };
        const resultadoTipo = results.map(ambiente => ({
            ...ambiente,
            tipo: tipoLab[ambiente.id_tipo_ambiente]
        }));
        res.json(resultadoTipo);
    });
});

// deletando laboratorios
router.delete('/laboratorios/deletar/:id', (req, res) => {
    const idAmbiente = req.params.id;

    const consulta = 'DELETE FROM ambientes WHERE id_ambiente = ?';

    conexao.query(consulta, [idAmbiente], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao deletar o ambiente.' });
        }
        res.status(200).json({ message: 'Ambiente deletado com sucesso!' });
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
            tipo: usuario.tipo === 1 ? 'Professor' : 'Administrador'
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