require('dotenv').config();
const server = require('./server');

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || '';

server.listen(port, () => console.log(`Apiance server running on ${port} and env ${env}`));
