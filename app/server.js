// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();

// adapte COM6 a ton port Arduino (ou passe ARDUINO_PORT dans l'env)
const port = new SerialPort({ path: process.env.ARDUINO_PORT || 'COM6', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let lastData = 'En attente...';
let lastDataUID = '';
const trainMapPath = path.join(__dirname, 'train-map.json');
let trainMap = {};

function loadTrainMap() {
  try {
    const raw = fs.readFileSync(trainMapPath, 'utf8');
    trainMap = JSON.parse(raw);
  } catch (err) {
    console.error(`Impossible de lire ${trainMapPath}: ${err.message}`);
    trainMap = {};
  }
}

const normalizeUid = (uid) => (uid || '').replace(/[^a-fA-F0-9]/g, '').toUpperCase();

loadTrainMap();

parser.on('data', (data) => {
  lastData = data.trim();
  if (lastData.search('UID') !== -1) {
    const parsed = lastData.split(':')[1];
    lastDataUID = parsed ? parsed.trim() : '';
    //console.log("Carte detectee :", lastData);
  }
});

app.get('/data', (req, res) => {
  const uid = lastDataUID;
  const train = trainMap[normalizeUid(uid)] || '';
  console.log({ uid, train });
  res.json({ uid, train });
});

app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Serveur sur http://localhost:3000');
});
