const express = require('express');
const cors = require('cors');
const { QuickDB } = require('quick.db');
const moment = require('moment');
const db = new QuickDB();

module.exports = function (client) {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json());

    /**
     * Health check
     */
    app.get('/status', (req, res) => {
        res.json({ status: 'online', timestamp: new Date().toISOString() });
    });

    /**
     * Retorna todos os usuários registrados
     */
    app.get('/usuarios', async (req, res) => {
        const data = await db.all();
        const users = data
            .filter(item => item.id.startsWith('user_id_'))
            .map(item => ({
                discordId: item.id.split('_')[2],
                guildId: item.id.split('_')[3],
                fivemId: item.value,
            }));
        res.json(users);
    });

    /**
     * Consulta registro por ID Discord
     */
    app.get('/registro/:userId', async (req, res) => {
        const userId = req.params.userId;
        const data = await db.all();
        const registro = data.find(d => d.id.startsWith(`user_id_${userId}_`));

        if (!registro) return res.status(404).json({ erro: 'Usuário não registrado.' });

        const fivemId = registro.value;
        const nome = await db.get(`nome_${userId}_${registro.id.split('_')[3]}`);
        res.json({ discordId: userId, fivemId, nome });
    });

    /**
     * Consulta por ID FiveM
     */
    app.get('/registro/fivem/:fivemId', async (req, res) => {
        const guilds = await db.all();
        const match = guilds.find(entry => entry.id.startsWith('user_fivem_') && entry.id.endsWith(`_${req.params.fivemId}`));

        if (!match) return res.status(404).json({ erro: 'ID FiveM não registrado.' });

        res.json({
            fivemId: req.params.fivemId,
            discordId: match.value,
        });
    });

    /**
     * Verifica status de ponto
     */
    app.get('/ponto/status/:userId/:guildId', async (req, res) => {
        const key = `ponto_aberto_${req.params.userId}_${req.params.guildId}`;
        const aberto = await db.get(key);
        if (!aberto) return res.json({ status: 'fechado' });

        const startTime = await db.get(`startTime_${req.params.userId}`);
        res.json({ status: 'aberto', desde: startTime });
    });

    /**
     * Histórico de pontos
     */
    app.get('/ponto/historico/:fivemId', async (req, res) => {
        const key = `historico_pontos_${req.params.fivemId}`;
        const historico = await db.get(key);

        if (!historico) return res.status(404).json({ erro: 'Nenhum ponto registrado.' });

        res.json(historico);
    });

    /**
     * Total de tempo trabalhado (em segundos e formatado)
     */
    app.get('/ponto/tempo-total/:fivemId', async (req, res) => {
        const historico = await db.get(`historico_pontos_${req.params.fivemId}`);
        if (!historico || !Array.isArray(historico)) return res.json({ segundos: 0, formatado: '00:00:00' });

        const totalSegundos = historico.reduce((acc, ponto) => acc + (ponto.duracaoSegundos || 0), 0);

        const duration = moment.utc(totalSegundos * 1000).format('HH:mm:ss');
        res.json({ segundos: totalSegundos, formatado: duration });
    });

    /**
     * Inicia o servidor da API
     */
    app.listen(PORT, () => {
        console.log(`✅ API rodando em http://localhost:${PORT}`);
    });
};
