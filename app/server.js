const express = require('express');
const fs = require('fs');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();

// Port série de l'Arduino (par défaut COM6, peut être surchargé via ARDUINO_PORT)
const serialPath = process.env.ARDUINO_PORT || 'COM6';
const port = new SerialPort({ path: serialPath, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const trainMapPath = path.join(__dirname, 'train-map.json');
let trainMap = {};
let lastUID = '';
let lastTrain = '';

const normalizeUid = (uid) => (uid || '').replace(/[^a-fA-F0-9]/g, '').toUpperCase();

function loadTrainMap() {
  try {
    const raw = fs.readFileSync(trainMapPath, 'utf8');
    const parsed = JSON.parse(raw);
    trainMap = {};
    Object.entries(parsed).forEach(([uid, name]) => {
      trainMap[normalizeUid(uid)] = name;
    });
  } catch (err) {
    console.error(`Impossible de lire ${trainMapPath}: ${err.message}`);
    trainMap = {};
  }
}

loadTrainMap();

parser.on('data', (data) => {
  const line = data.trim();
  if (!line) return; // ignore les lignes vides, on garde le dernier train vu

  if (line.toUpperCase().includes('UID')) {
    const parts = line.split(':');
    const rawUid = parts[1] ? parts[1].trim() : '';
    lastUID = rawUid;
    lastTrain = trainMap[normalizeUid(rawUid)] || '';
    console.log(`[SERIAL] UID lu: "${lastUID}" -> train: "${lastTrain || 'non trouvé'}"`);
  }
});

app.get('/data', (req, res) => {
  console.log(`[HTTP] /data -> uid="${lastUID}" train="${lastTrain}"`);
  res.json({ uid: lastUID, train: lastTrain });
});

app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Serveur sur http://localhost:3000');
});
