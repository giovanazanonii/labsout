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
module.exports = router;