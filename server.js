const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors()); 
app.use(express.json()); 

const db = mysql.createPool({
    uri: 'mysql://root:EBgJYHgtASfViyICRJKloXChVTJLXdYX@zephyr.proxy.rlwy.net:36227/railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado com sucesso ao banco de dados no Railway!');
        connection.release();
    }
});

// ==========================================
// ROTAS
// ==========================================

// Rota de Cadastro
app.post('/api/register', (req, res) => {
    const { nome, email, senha } = req.body;

    db.query('SELECT email FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        if (results.length > 0) return res.status(400).json({ error: 'E-mail já cadastrado!' });

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
            const user = results[0];
            res.status(200).json({ 
                message: 'Login realizado com sucesso!', 
                user: { 
                    nome: user.nome, 
                    email: user.email, 
                    streak: user.streak, 
                    foto: user.foto, 
                    lastCompletion: user.lastCompletion 
                }
            });
        } else {
            res.status(401).json({ error: 'E-mail ou senha incorretos!' });
        }
    });
});

// Rota para Atualizar a Foto
app.post('/api/update-photo', (req, res) => {
    const { email, foto } = req.body;

    if (!email || !foto) {
        return res.status(400).json({ error: 'E-mail e foto são obrigatórios.' });
    }

    const sql = 'UPDATE usuarios SET foto = ? WHERE email = ?';
    db.query(sql, [foto, email], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar foto:', err);
            return res.status(500).json({ error: 'Erro no servidor ao salvar a foto.' });
        }
        res.status(200).json({ message: 'Foto atualizada com sucesso!' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
