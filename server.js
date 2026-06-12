const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

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

app.use(express.static(path.join(__dirname, 'public')));


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
                    lastCompletion: user.lastCompletion,
                    // CORREÇÃO AQUI: Agora o login devolve o progresso do aluno!
                    nota_diagnostica: user.nota_diagnostica,
                    avaliacao_concluida: user.avaliacao_concluida,
                    mod1_concluido: user.mod1_concluido
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

// Rota para Salvar Nota
app.post('/api/salvar-nota', (req, res) => {
    const { email, nota } = req.body;

    if (!email) {
        return res.status(400).json({ erro: "Email não fornecido." });
    }

    //  Atualiza a coluna nota_diagnostica e avaliacao_concluida
    const query = "UPDATE usuarios SET nota_diagnostica = ?, avaliacao_concluida = true WHERE email = ?";
    
    db.query(query, [nota, email], (err, results) => {
        if (err) {
            console.error("Erro ao salvar nota no Railway:", err);
            return res.status(500).json({ erro: "Erro ao salvar no banco de dados." });
        }
        res.json({ sucesso: true, mensagem: "Nota salva com sucesso!" });
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// ==========================================
// ROTAS DO FÓRUM (CORRIGIDAS COM .promise())
// ==========================================

// 1. Rota para CRIAR um post
app.post('/api/forum/post', async (req, res) => {
    const { user_email, user_nome, user_foto, conteudo, imagem_url } = req.body;
    try {
        const query = `INSERT INTO forum_posts (user_email, user_nome, user_foto, conteudo, imagem_url) VALUES (?, ?, ?, ?, ?)`;
        // Adicionado .promise() antes de .query()
        await db.promise().query(query, [user_email, user_nome, user_foto, conteudo, imagem_url || null]);
        res.status(201).json({ message: "Post publicado com sucesso!" });
    } catch (error) {
        console.error("Erro ao publicar post:", error);
        res.status(500).json({ error: "Erro ao publicar post." });
    }
});

// 2. Rota para CRIAR um comentário
app.post('/api/forum/comment', async (req, res) => {
    const { post_id, user_email, user_nome, user_foto, comentario } = req.body;
    try {
        const query = `INSERT INTO forum_comentarios (post_id, user_email, user_nome, user_foto, comentario) VALUES (?, ?, ?, ?, ?)`;
        // Adicionado .promise() antes de .query()
        await db.promise().query(query, [post_id, user_email, user_nome, user_foto, comentario]);
        res.status(201).json({ message: "Comentário adicionado!" });
    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        res.status(500).json({ error: "Erro ao adicionar comentário." });
    }
});

// 3. Rota para BUSCAR todos os posts e seus comentários
app.get('/api/forum/posts', async (req, res) => {
    try {
        // Adicionado .promise() antes de .query()
        const [posts] = await db.promise().query(`SELECT * FROM forum_posts ORDER BY criado_em DESC`);
        
        // Adicionado .promise() antes de .query()
        const [comentarios] = await db.promise().query(`SELECT * FROM forum_comentarios ORDER BY criado_em ASC`);
        
        // Agrupa os comentários dentro dos seus respectivos posts
        const postsComComentarios = posts.map(post => {
            return {
                ...post,
                comentarios: comentarios.filter(c => c.post_id === post.id)
            };
        });

        res.status(200).json(postsComComentarios);
    } catch (error) {
        console.error("Erro ao carregar o fórum:", error);
        res.status(500).json({ error: "Erro ao carregar o fórum." });
    }
});

// 3. Rota para BUSCAR todos os posts e seus comentários (ATUALIZADA COM CURTIDAS)
app.get('/api/forum/posts', async (req, res) => {
    try {
        const [posts] = await db.promise().query(`SELECT * FROM forum_posts ORDER BY criado_em DESC`);
        const [comentarios] = await db.promise().query(`SELECT * FROM forum_comentarios ORDER BY criado_em ASC`);
        
        // NOVO: Busca todas as curtidas para sabermos quem curtiu o que
        const [curtidas] = await db.promise().query(`SELECT * FROM forum_curtidas`);
        
        const postsCompletos = posts.map(post => {
            return {
                ...post,
                comentarios: comentarios.filter(c => c.post_id === post.id),
                // NOVO: Cria uma lista só com os emails de quem curtiu este post específico
                usuarios_que_curtiram: curtidas.filter(l => l.post_id === post.id).map(l => l.user_email)
            };
        });

        res.status(200).json(postsCompletos);
    } catch (error) {
        console.error("Erro ao carregar o fórum:", error);
        res.status(500).json({ error: "Erro ao carregar o fórum." });
    }
});

// 5. Rota para DELETAR um post
app.delete('/api/forum/post/:id', async (req, res) => {
    try {
        await db.promise().query(`DELETE FROM forum_posts WHERE id = ?`, [req.params.id]);
        res.status(200).json({ message: "Post deletado!" });
    } catch (error) {
        console.error("Erro ao deletar post:", error);
        res.status(500).json({ error: "Erro ao deletar post." });
    }
});

// 6. Rota para EDITAR um post
app.put('/api/forum/post/:id', async (req, res) => {
    const { conteudo } = req.body;
    try {
        await db.promise().query(`UPDATE forum_posts SET conteudo = ? WHERE id = ?`, [conteudo, req.params.id]);
        res.status(200).json({ message: "Post atualizado!" });
    } catch (error) {
        console.error("Erro ao atualizar post:", error);
        res.status(500).json({ error: "Erro ao atualizar post." });
    }
});


