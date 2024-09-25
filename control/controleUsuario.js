const express = require("express");
const router = express.Router();
const path = require("path");
const conexao = require('../banco/conexao');

const app = express();
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');


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
// Rota para verificar a disponibilidade de horários
// Rota para verificar a disponibilidade de horários
router.get('/disponibilidade/:ambienteId', (req, res) => {
    const { data_reserva } = req.query; // Data passada na query string
    const { ambienteId } = req.params;  // ID do ambiente

    // Query para buscar os horários já reservados para o ambiente e data selecionados
    const sqlReservados = `
        SELECT id_horario 
        FROM reservas 
        WHERE id_ambiente = ? AND data_reserva = ? AND status = 'confirmado'
    `;

    // Query para buscar todos os horários disponíveis
    const sqlTodosHorarios = `
        SELECT id_horario 
        FROM horarios
    `;

    conexao.query(sqlReservados, [ambienteId, data_reserva], (errorReservados, resultsReservados) => {
        if (errorReservados) {
            console.error("Erro ao buscar horários reservados:", errorReservados);
            return res.status(500).send("Erro ao buscar disponibilidade de horários.");
        }

        // Lista de horários reservados
        const horariosReservados = resultsReservados.map(row => row.id_horario);

        // Busca todos os horários disponíveis
        conexao.query(sqlTodosHorarios, (errorTodos, resultsTodos) => {
            if (errorTodos) {
                console.error("Erro ao buscar todos os horários:", errorTodos);
                return res.status(500).send("Erro ao buscar todos os horários.");
            }

            // Lista de todos os horários disponíveis
            const todosHorarios = resultsTodos.map(row => row.id_horario);

            // Filtra os horários não disponíveis (reservados)
            const horariosIndisponiveis = todosHorarios.filter(horario => horariosReservados.includes(horario));

            // Retorna os horários não disponíveis para renderização no frontend
            res.json({
                ambienteId,
                data_reserva,
                horariosIndisponiveis,
            });
        });
    });
});


router.get('/horarios/:ambienteId', (req, res) => {
    const { dia, mes, ano } = req.query;
    const { ambienteId } = req.params;
    
    // Renderizar a página de horários com os dados do dia, mês, ano, e ambiente
    res.render('pages/horarios', { ambienteId, dia, mes, ano });
});

// Rota para calendário com ID do ambiente
router.get("/calendario/:id", (req, res) => {
    const ambienteId = req.params.id; // Captura o ID do ambiente

    const dia = req.query.dia;
    const mes = req.query.mes;
    const ano = req.query.ano;

    console.log(`ID Ambiente: ${ambienteId}, Dia: ${dia}, Mês: ${mes}, Ano: ${ano}`);

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
