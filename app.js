const path = require('path');
const express = require('express');

const app = express();

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
  res.send('Hello from server');
});

module.exports = app;
