const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Configuração do CORS (Permite que o seu front-end converse com este back-end)
app.use(cors()); 
app.use(express.json()); 

// Usar createPool no lugar de createConnection é obrigatório na nuvem.
// Ele reconecta automaticamente caso o banco de dados do Railway durma ou oscile.
const db = mysql.createPool({
    uri: 'mysql://root:EBgJYHgtASfViyICRJKloXChVTJLXdYX@zephyr.proxy.rlwy.net:36227/railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão para garantir que o banco está respondendo
db.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados MySQL no Railway:', err.message);
    } else {
        console.log('Conectado com sucesso ao banco de dados MySQL no Railway!');
        connection.release(); // Libera a conexão de volta para o Pool
    }
});

// ==========================================
// ROTAS DA API
// ==========================================

// Rota de Cadastro
app.post('/api/register', (req, res) => {
    const { nome, email, senha } = req.body;

    // Verifica se o e-mail já existe
    db.query('SELECT email FROM usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Erro na query de verificação:', err);
            return res.status(500).json({ error: 'Erro no servidor ao verificar usuário.' });
        }
        
        if (results.length > 0) {
            return res.status(400).json({ error: 'E-mail já cadastrado!' });
        }

        // Insere o novo usuário
        const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        db.query(sql, [nome, email, senha], (err, result) => {
            if (err) {
                console.error('Erro ao inserir usuário:', err);
                return res.status(500).json({ error: 'Erro ao cadastrar no banco de dados.' });
            }
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
        });
    });
});

// Rota de Login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    db.query(sql, [email, senha], (err, results) => {
        if (err) {
            console.error('Erro na query de login:', err);
            return res.status(500).json({ error: 'Erro no servidor ao tentar logar.' });
        }
        
        if (results.length > 0) {
            // Retorna os dados do usuário (exceto a senha)
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

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
// O process.env.PORT é obrigatório para o Render saber onde expor o servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
