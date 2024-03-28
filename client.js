const { createClient } = require('redis');

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

client.connect({
    root:true,
    user: process.env.REDISUSER,
    host: process.env.REDISHOST,
    port: process.env.REDISPORT,
    password: process.env.REDISPASSWORD
});

module.exports = {client};