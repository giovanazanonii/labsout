const express = require('express');
const app = express();
const controleUsuario = require('./cont_usuario/controleUsuario');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use("/",controleUsuario);

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => {
  console.log(`Servidor rodando`);
});