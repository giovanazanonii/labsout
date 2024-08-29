const express = require("express");
const router = express.Router();
const db = require('../banco/conexao');
const app = express();
app.use(express.json());

router.get("/login", (req, res) => {
    res.render("pages/login");
});
router.get("/modificarsenha",(req,res)=>{
    res.render("pages/modificarsenha")
})
router.get("/telausuario",(req,res)=>{
    res.render("pages/telausuario")
})
router.get("/inicialadmin",(req,res)=>{
    res.render("pages/inicialadmin")
})
router.get("/inicialusuario",(req,res)=>{
    res.render("pages/inicialusuario")
})
router.get("/selecaolab",(req,res)=>{
    res.render("pages/selecaolab")
})

// Rota de login
app.post('/login', (req, res) => {
  const { cpf, senha } = req.body;

  if (!cpf || !senha) {
    return res.status(400).json({ message: 'CPF e senha são obrigatórios.' });
  }

  db.query('SELECT * FROM usuario WHERE cpf_usuario = ? AND senha_usuario = ?', [cpf, senha], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao consultar o banco de dados.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'CPF ou senha incorretos.' });
    }

    // Usuário autenticado com sucesso
    res.json({ message: 'Login bem-sucedido!' });
  });
});
module.exports = router;