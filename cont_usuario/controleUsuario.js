const express = require("express");
const router = express.Router();

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
module.exports = router;