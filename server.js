const http = require('http');
const { ExpressPeerServer } = require('peer');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const app = require('./app');
const server = http.createServer(app);

const io = require('./ioServer');
io.listen(server);

const peerServer = ExpressPeerServer(server);
app.use('/peerjs', peerServer);

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
