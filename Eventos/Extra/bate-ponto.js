const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/**
 * Retorna todos os usuários registrados
 */
app.get('/registrados', async (req, res) => {
    const data = await db.all();
    const registros = data
        .filter(item => item.id.startsWith('registro_'))
        .map(item => ({
            userId: item.id.replace('registro_', ''),
            ...item.value
        }));
    res.json(registros);
});

/**
 * Consulta registro por ID do usuário (Discord)
 */
app.get('/registro/:userId', async (req, res) => {
    const registro = await db.get(`registro_${req.params.userId}`);
    if (!registro) return res.status(404).json({ erro: 'Usuário não registrado.' });
    res.json(registro);
});

/**
 * Verifica status do ponto (aberto/fechado)
 */
app.get('/ponto/status/:userId', async (req, res) => {
    const aberto = await db.get(`pontoAberto_${req.params.userId}`);
    if (!aberto) return res.json({ status: 'fechado' });
    res.json({ status: 'aberto', desde: aberto });
});

/**
 * Retorna o histórico de pontos do usuário
 */
app.get('/ponto/historico/:userId', async (req, res) => {
    const historico = await db.get(`historicoPonto_${req.params.userId}`);
    if (!historico) return res.status(404).json({ erro: 'Histórico não encontrado.' });
    res.json(historico);
});

app.listen(PORT, () => {
    console.log(`✅ API rodando em http://localhost:${PORT}`);
});
