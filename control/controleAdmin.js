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
    res.render("pages/cadastroambiente", { ambiente: undefined })
})
router.get("/cadastrarusuario",(req,res)=>{
    res.render("pages/cadastrarusuario", { usuario: undefined })
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

// carregar ambientes com seus respectivos dados pronto  para editar
router.get('/cadastroambiente/:id', (req, res) => {
    const id = req.params.id;
    const consulta = 'SELECT * FROM ambientes WHERE id_ambiente = ?';

    conexao.query(consulta, [id], function (err, resultado) {
        if (err) {
            console.error(err);
            return res.redirect('/laboratorios?message=Erro ao carregar o ambiente.&type=danger');
        }

        if (resultado.length > 0) {
            const ambiente = resultado[0];
            res.render('pages/cadastroambiente', { ambiente }); // Certifique-se de que o caminho esteja correto
        } else {
            res.redirect('/laboratorios?message=Ambiente não encontrado.&type=danger');
        }
    });
});


// editar um ambiente existente
router.post('/atualizarambiente/:id', (req, res) => {
    const idAmbiente = req.params.id;
    const { nomeambiente, capacidade, localizacao, tipo } = req.body;

    const consulta = 'UPDATE ambientes SET nome_ambiente = ?, capacidade_ambiente = ?, localizacao_ambiente = ?, id_tipo_ambiente = ? WHERE id_ambiente = ?';
    
    conexao.query(consulta, [nomeambiente, capacidade, localizacao, tipo, idAmbiente], (err) => {
        if (err) {
            console.error(err);
            return res.redirect(`/cadastroambiente/${idAmbiente}?message=Erro ao atualizar ambiente.&type=danger`);
        }
        res.redirect(`/cadastroambiente/${idAmbiente}?message=Ambiente atualizado com sucesso!&type=success`);
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

//carregar usuarios com seus respectivos dados pronto  para editar
router.get('/cadastrarusuario/:id?', (req, res) => {
    const id = req.params.id;

    if (id) {
        const consulta = 'SELECT * FROM usuario WHERE id_usuario = ?';
        conexao.query(consulta, [id], function (err, resultado) {
            if (err) {
                console.error(err);
                return res.redirect('/usuarios?message=Erro ao carregar o usuário.&type=danger');
            }
            if (resultado.length > 0) {
                const usuario = resultado[0];
                res.render('pages/cadastrarusuario', { usuario });
            } else {
                res.redirect('/usuarios?message=Usuário não encontrado.&type=danger');
            }
        });
    } else {
        res.render('pages/cadastrarusuario');
    }
});


//atualiza um usuario ja existente
router.post('/atualizarusuario/:id', (req, res) => {
    const id = req.params.id;
    const { nome, senha, cpf, tipo } = req.body;

    const consulta = 'UPDATE usuario SET nome_usuario = ?, senha_usuario = ?, cpf_usuario = ?, tipo_usuario = ? WHERE id_usuario = ?';

    conexao.query(consulta, [nome, senha, cpf, tipo, id], (err) => {
        if (err) {
            console.error(err);
            return res.redirect(`/cadastrarusuario/${id}?message=Erro ao atualizar usuário.&type=danger`);
        }
        res.redirect(`/cadastrarusuario/${id}?message=Usuário atualizado com sucesso!&type=success`);
    });
});

//cadastrando usuarios
router.post('/cadastrarusuario', (req, res) => {
    const nome = req.body.nome;
    const senha = req.body.senha;
    const cpf = req.body.cpf.replace(/\D/g, '');;
    let tipo = req.body.tipo;

    if (tipo.toLowerCase() === "professor") {
        tipo = 1;
    } else if (tipo.toLowerCase() === "admin") {
        tipo = 2;
    } else {
        return res.redirect('/cadastrarusuario?message=Tipo de usuário inválido. Use "professor" ou "admin".&type=danger');
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

// Visualizar todos os usuários - admin
router.get('/usuarios/listar', (req, res) => {
    conexao.query('SELECT id_usuario, nome_usuario AS nome, senha_usuario AS senha, cpf_usuario AS cpf, tipo_usuario AS tipo FROM usuario', (error, results) => {
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
    const consulta = 'DELETE FROM usuario WHERE id_usuario = ?';
  
    conexao.query(consulta, [usuarioId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao excluir o usuário.' });
        }
        res.status(200).json({ message: 'Usuário excluído com sucesso.' });
    });
});


module.exports = router;