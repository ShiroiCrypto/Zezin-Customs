const express = require('express');
const server = express();

server.get('/', (req,res) => {
    return res.json({Retorno: 'Nossa APi está online'})
})

server.listen(80, () => {
    console.log('Servido está funcionando...')
})