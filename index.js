const express = require('express');
const app = express();
const session = require('express-session');
const controleUsuario = require('./cont_usuario/controleUsuario');
const path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'nawd',
  resave: false,
  saveUninitialized: true,
}));

app.use("/",controleUsuario);

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => {
  console.log(`Servidor rodando`);
});