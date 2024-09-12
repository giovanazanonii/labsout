const express = require("express");
const router = express.Router();
const conexao = require('../banco/conexao');

//middlewares no router
router.use(express.json());
router.use(express.static('public'));
router.use(express.urlencoded({ extended: true }));

router.get("/login", (req, res) => {
    res.render("pages/login");
});
router.get("/modificarsenha",(req,res)=>{
    res.render("pages/modificarsenha")
})
router.get("/telausuario",(req,res)=>{
    res.render("pages/telausuario")
})
router.get("/inicialusuario",(req,res)=>{
    res.render("pages/inicialusuario")
})
router.get("/listagemusuario",(req,res)=>{
    res.render("pages/listagemusuario")
})
router.get("/usuarios",(req,res)=>{
    res.render("pages/usuarios")
})
router.get("/calendario",(req,res)=>{
    res.render("pages/calendario")
})
router.get("/calendario2",(req,res)=>{
    res.render("pages/calendario2")
})
router.get("/calendario3",(req,res)=>{
    res.render("pages/calendario3")
})
router.get("/horarios", (req, res) => {
    res.render("pages/horarios");
});
//autenticação de login
router.post('/login', (req, res) => {
    //replace remove a mascara do cpf para autenticar
    const cpf = req.body.cpf.replace(/\D/g, '');
    const senha = req.body.senha;

    const query = 'SELECT * FROM usuario WHERE cpf_usuario = ? AND senha_usuario = ?';

    conexao.query(query, [cpf, senha], (error, results) => {
        if (error) {
            console.error('Erro ao executar a consulta: ' + error.stack);
            res.status(500).send('Erro no servidor');
            return;
        } 
        if (results.length > 0) {
            const usuario = results[0];
            // guardando o CPF do usuário na sessão para modificar senha
            req.session.cpf = cpf;

            // verifica se é o primeiro login e se o usuario não é admin
            if (usuario.primeiro_login && usuario.tipo_usuario === 1) {
                res.redirect('/modificarsenha');
            } else {
                // redireciona conforme o tipo de usuário
                if (usuario.tipo_usuario === 1) {
                    res.redirect('/inicialusuario');
                } else if (usuario.tipo_usuario === 2) {
                    res.redirect('/inicialadmin');
                }
            }
        } else {
            res.redirect('/login?message=Dados+incorretos.+Por+favor,+tente+novamente.&type=danger');
        }
    });
});

// visualizar laboratorios
router.get("/selecaolab", (req, res) => {
    const consulta = "SELECT * FROM ambientes";

    conexao.query(consulta, (error, results) => {
        if (error) {
            return res.status(500).send("Erro ao buscar os ambientes no banco de dados.");
        }
        res.render("pages/selecaolab", { ambientes: results });
    });
});

//modificação de senha
router.post('/modificarsenha', (req, res) => {
    const senha = req.body.senha;
    const novasenha = req.body.novasenha;
    const confirmarsenha = req.body.confirmarsenha;

    if (senha === novasenha) {
        return res.redirect('/modificarsenha?message=A+nova+senha+não+pode+ser+igual+à+senha+atual&type=danger');
    }
    if (novasenha !== confirmarsenha) {
        return res.redirect('/modificarsenha?message=As+novas+senhas+n%C3%A3o+coincidem&type=danger');
    }

    const query = 'SELECT * FROM usuario WHERE cpf_usuario = ? AND senha_usuario = ?';
    conexao.query(query, [req.session.cpf, senha], (error, results) => {
        if (error) {
            console.error('Erro ao executar a consulta: ' + error.stack);
            return res.status(500).send('Erro no servidor');
        }

        if (results.length === 0) {
            return res.redirect('/modificarsenha?message=Senha+atual+incorreta&type=danger');
        }
            //atualizando primeiro_login para falso quando o usuario ja realizou o primeiro login e modificou senha
        const atualiza = 'UPDATE usuario SET senha_usuario = ?, primeiro_login = FALSE WHERE cpf_usuario = ?';
        conexao.query(atualiza, [novasenha, req.session.cpf], (error) => {
            if (error) {
                console.error('Erro ao atualizar a senha: ' + error.stack);
                return res.status(500).send('Erro no servidor');
            }
            res.redirect('/inicialusuario');
        });
    });
});
module.exports = router;
