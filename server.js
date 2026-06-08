const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite que o seu HTML converse com este servidor
app.use(express.json()); // Permite receber dados em formato JSON

// Conexão com o banco de dados Railway
// AVISO: Em um projeto real, coloque essa URL em um arquivo .env
const db = mysql.createConnection('mysql://root:EBgJYHgtASfViyICRJKloXChVTJLXdYX@zephyr.proxy.rlwy.net:36227/railway');

db.connect(err => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL no Railway!');
});

// Rota de Cadastro
app.post('/api/register', (req, res) => {
    const { nome, email, senha } = req.body;

    // Verifica se o e-mail já existe
    db.query('SELECT email FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        if (results.length > 0) return res.status(400).json({ error: 'E-mail já cadastrado!' });

        // Insere o novo usuário
        const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        db.query(sql, [nome, email, senha], (err, result) => {
            if (err) return res.status(500).json({ error: 'Erro ao cadastrar' });
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
        });
    });
});

// Rota de Login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    db.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        
        if (results.length > 0) {
            // Retorna os dados do usuário (exceto a senha) para o front-end salvar no localStorage
            const user = results[0];
            res.status(200).json({ 
                message: 'Login realizado com sucesso!', 
                user: { nome: user.nome, email: user.email, streak: user.streak, foto: user.foto, lastCompletion: user.lastCompletion }
            });
        } else {
            res.status(401).json({ error: 'E-mail ou senha incorretos!' });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
