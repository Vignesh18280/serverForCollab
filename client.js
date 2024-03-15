const { createClient } = require('redis');

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

client.connect({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

module.exports = {client};