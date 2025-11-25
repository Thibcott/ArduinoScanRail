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
let lastTrain = '';
const trainMapPath = path.join(__dirname, 'train-map.json');
let trainMap = {};

function loadTrainMap() {
  try {
    const raw = fs.readFileSync(trainMapPath, 'utf8');
    const parsed = JSON.parse(raw);
    trainMap = {};
    // Normalise les clés (retire espaces/séparateurs et uppercase) pour éviter les écarts de format
    Object.entries(parsed).forEach(([uid, name]) => {
      trainMap[normalizeUid(uid)] = name;
    });
  } catch (err) {
    console.error(`Impossible de lire ${trainMapPath}: ${err.message}`);
    trainMap = {};
  }
}

const normalizeUid = (uid) => (uid || '').replace(/[^a-fA-F0-9]/g, '').toUpperCase();

loadTrainMap();

parser.on('data', (data) => {
  lastData = data.trim();
  // Ignore les lignes vides: on garde le dernier train vu
  if (!lastData) {
    return;
  }
  if (lastData.search('UID') !== -1) {
    const parsed = lastData.split(':')[1];
    lastDataUID = parsed ? parsed.trim() : '';
    lastTrain = trainMap[normalizeUid(lastDataUID)] || '';
    //console.log("Carte detectee :", lastData);
  }
});

app.get('/data', (req, res) => {
  const uid = lastDataUID;
  const train = lastTrain;
  console.log({ uid, train });
  res.json({ uid, train });
});

app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Serveur sur http://localhost:3000');
});
