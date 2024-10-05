const express = require("express");
const router = express.Router();
const path = require("path");
const conexao = require('../banco/conexao');

const app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

let id_user //ambienteId, data_reserva, id_horario

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
    console.log(req.session.usuario);
    res.render('pages/telausuario', { usuario: req.session.usuario });
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
router.get("/horarios", (req, res) => {
    res.render("pages/horarios");
});
router.get("/descricao",(req,res)=>{
    res.render("pages/descricao")
})

// Rota para cadastrar uma nova reserva
router.post('/reservar', (req, res) => {
    let error = [];
    const id_ambiente = req.session.ambienteId;
    const data_reserva_ses = req.session.data_reserva

    console.log(req.body.horarios);
    let lista_horarios = req.body.horarios;
    for (i=0;i<lista_horarios.length;i++){
       // console.log(lista_horarios[i])


        const inserir = `
        INSERT INTO reservas (id_usuario, id_ambiente, data_reserva, id_horario, status)
        VALUES (?, ?, ?, ?, 'confirmado')`;
        
        console.log(id_user, id_ambiente, data_reserva_ses, lista_horarios[i])

        conexao.query(inserir, [id_user, id_ambiente, data_reserva_ses, lista_horarios[i]], (error, results) => {
            if (error) {
                console.error("Erro ao cadastrar reserva:", error);
                error.push(`Erro ao cadastrar horário ${lista_horarios[i]}`);
            }
        });

    }
    if (error.length > 0) {
        return res.status(500).send(error.join(', '));
    }
    res.status(201).send("Reserva cadastrada com sucesso!");


    //req.body.id_horario

    // Query para inserir os dados na tabela de reservas
    /*const inserir = `
        INSERT INTO reservas (id_usuario, id_ambiente, data_reserva, id_horario, status)
        VALUES (?, ?, ?, 1, 'confirmado')
    `;*/
    
    /*console.log(id_user, id_ambiente, data_reserva_ses)
    conexao.query(inserir, [id_user, id_ambiente, data_reserva_ses, '1'], (error, results) => {
        if (error) {
            console.error("Erro ao cadastrar reserva:", error);
            return res.status(500).send("Erro ao cadastrar a reserva.");
        }
        res.status(201).send("Reserva cadastrada com sucesso!");
    });*/
});


router.get('/horarios/:ambienteId', (req, res) => {
    const { dia, mes, ano } = req.query;
    
    const { ambienteId } = req.params;
    req.session.ambienteId = ambienteId;

    const data_reserva = `${ano}-${mes}-${dia}`;
    req.session.data_reserva = data_reserva;

    // Query para buscar os horários já reservados
    const sqlReservados = `
        SELECT id_horario 
        FROM reservas 
        WHERE id_ambiente = ? AND data_reserva = ? AND status = 'confirmado'
    `;

    conexao.query(sqlReservados, [ambienteId, data_reserva], (errorReservados, resultsReservados) => {
        if (errorReservados) {
            console.error("Erro ao buscar horários reservados:", errorReservados);
            return res.status(500).send("Erro ao buscar disponibilidade de horários.");
        }

        // Lista de horários reservados
        const horariosReservados = resultsReservados.map(row => row.id_horario);

        // Renderizar a página de horários passando as variáveis necessárias
        res.render('pages/horarios', { 
            ambienteId, 
            dia, 
            mes, 
            ano, 
            horariosIndisponiveis: horariosReservados 
        });
    });
});



// Rota para calendário com ID do ambiente
router.get("/calendario/:id", (req, res) => {
    const ambienteId = req.params.id; // Captura o ID do ambiente

    // Ajuste a consulta para usar o nome correto da coluna
    const consultaAmbiente = "SELECT * FROM ambientes WHERE id_ambiente = ?";
    conexao.query(consultaAmbiente, [ambienteId], (error, results) => {
        if (error) {
            console.error('Erro na consulta:', error);
            return res.status(500).send("Erro ao buscar informações do ambiente.");
        }

        // Verifica se o resultado não está vazio
        if (results.length === 0) {
            return res.status(404).send("Ambiente não encontrado.");
        }
        
        // Renderiza a tela do calendário e passa o ID do ambiente
        res.render("pages/calendario", { ambienteId: ambienteId, ambiente: results[0] });
    });
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
            // guardando o nome do usuario para utilizar dentro do sistema
            req.session.usuario = usuario;
            // guardando o CPF do usuário na sessão para modificar senha
            req.session.cpf = cpf;
            id_user = results[0].id_usuario;


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


// visualizar laboratorios -- puxando do banco
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
