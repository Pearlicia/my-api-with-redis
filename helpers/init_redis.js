const redis = require('redis')
const { createClient } = require('redis');

const client = createClient({
        host: 'redis-11105.c84.us-east-1-2.ec2.cloud.redislabs.com',
        port: 11105
});


// const client = redis.createClient({
//     host: '127.0.0.1',
//     port: 6379,
  
// })

client
  .connect()
  .then(async (res) => {
    console.log('connected');
  })
  .catch((err) => {
    console.log('err happened' + err);
  });

client.on('connect', () => {
  console.log('Client connected to redis...')
})

client.on('ready', () => {
  console.log('Client connected to redis and ready to use...')
})

client.on('error', (err) => {
  console.log(err.message)
})

client.on('end', () => {
  console.log('Client disconnected from redis')
})

process.on('SIGINT', () => {
  client.quit()
})

module.exports = client;