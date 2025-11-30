# ArduinoScanRail

Mini démonstrateur Arduino + RFID + affichage web inspiré des écrans CFF/SBB.

## Matériel
- Arduino + lecteur RFID MFRC522
- Badge(s) RFID
- USB relié é la machine (port série détecté comme COMx)

## Logiciel requis
- Node.js 20+
- Bibliothéque Arduino MFRC522 installée dans l'IDE Arduino

## Installation (côté Node)
`Bash
cd app
npm install
`

## Configuration
- Détecter le port série Arduino (ex. COM3, COM4) et l'exposer via la variable d'environnement :
  - Windows PowerShell : setx ARDUINO_PORT COM3
  - Sinon, modifier directement app/server.js (clé serialPath).
- Mapper les UID RFID aux trains dans app/train-map.json :
`json
{
  "BA 57 A2 1A": "RE33",
  "22 16 46 02": "REGIONALPS"
}
`
Les espaces/tirets sont ignorés et les lettres mises en majuscule lors du chargement.

## Lancer le serveur
`bash
cd app
node server.js
`
- Le serveur écoute sur http://localhost:3000
- Les logs série/HTTP séaffichent dans la console (UID lu et train associé).

## Interface web
- Ouvrir http://localhost:3000 : l'écran imite un panneau CFF et affiche
  "Entrée en gare du train ..." pour le dernier badge détecté.

## Arduino (sketch sketch_nov18a.ino)
- Lit les UID via MFRC522 et les envoie sur le port série é 9600 bauds.
- Envoie périodiquement une ligne vide séil n'y a pas de nouvelle détection.
- Téléverser le sketch depuis léIDE Arduino aprés avoir sélectionné la bonne carte et le bon port.

## Dépannage
- Si "Opening COMx: File not found" : vérifier le port dans le Gestionnaire de périphériques ou avec 
px serialport-list, puis ajuster ARDUINO_PORT.
- Fermer tout moniteur série (IDE Arduino) avant de lancer 
ode server.js.
- Vérifier les UID bruts dans la console et les comparer : 	rain-map.json (normalisation : espaces/tirets retirés, majuscules).
