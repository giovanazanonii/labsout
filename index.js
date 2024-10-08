const express = require('express');
const app = express();
const session = require('express-session');
const controleUsuario = require('./control/controleUsuario');
const controleAdmin = require('./control/controleAdmin')
const path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'nawd',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 30 }
}));

app.use("/",controleUsuario);
app.use("/",controleAdmin);

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => {
  console.log(`Servidor rodando`);
});