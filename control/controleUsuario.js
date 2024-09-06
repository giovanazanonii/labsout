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
router.get("/selecaolab",(req,res)=>{
    res.render("pages/selecaolab")
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

//autenticação de login
router.post('/login', (req, res) => {
    console.log(req.body);
    const cpf = req.body.cpf;
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
            //guardando o cpf do usuario para usar na modificação de senha
            req.session.cpf = cpf;

            if (usuario.tipo_usuario === 1) {
              res.render("pages/modificarsenha");
          } else {
            (usuario.tipo_usuario === 2)
              res.render("pages/inicialadmin");
          }
        } else {
          res.render("pages/login", { errorMessage: 'CPF ou senha inválidos' });
        }
    });
});
//modificação de senha
router.post('/modificarsenha', (req, res) => {
  const senha = req.body.senha;
  const novasenha = req.body.novasenha;
  const confirmarsenha = req.body.confirmarsenha;

  //verificando se a novasenha é igual a confirmarsenha
  if (novasenha !== confirmarsenha) {
      return res.render("pages/modificarsenha", { errorMessage: 'As novas senhas não coincidem' });
  }

  const query = 'SELECT * FROM usuario WHERE cpf_usuario = ? AND senha_usuario = ?';
  conexao.query(query, [req.session.cpf, senha], (error, results) => {
      if (error) {
          console.error('Erro ao executar a consulta: ' + error.stack);
          return res.status(500).send('Erro no servidor');
      }
      if (results.length === 0) {
          return res.render("pages/modificarsenha", { errorMessage: 'Senha atual incorreta' });
      }

      const atualiza = 'UPDATE usuario SET senha_usuario = ? WHERE cpf_usuario = ?';
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
