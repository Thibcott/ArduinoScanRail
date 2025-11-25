#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10
#define RST_PIN 9

MFRC522 mfrc522(SS_PIN, RST_PIN);
unsigned long lastEmptySent = 0;
const unsigned long EMPTY_SEND_INTERVAL_MS = 300;  // limit empty string spam

void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Approche un badge RFID compatible (13.56 MHz)...");
}

void loop() {
  // Rien de nouveau -> on sort
  if (!mfrc522.PICC_IsNewCardPresent()) {

    // Envoie périodiquement une chaîne vide quand il n'y a rien de nouveau
    unsigned long now = millis();
    if (now - lastEmptySent >= EMPTY_SEND_INTERVAL_MS) {
      Serial.println("");
      lastEmptySent = now;
    }
    return;
  }

  // Carte présente mais impossible de lire l'UID
  if (!mfrc522.PICC_ReadCardSerial()) {
    Serial.println("Carte détectée mais échec de lecture.");
    return;
  }

  Serial.print("UID : ");
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) Serial.print("0");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
    Serial.print(" ");
  }
  Serial.println();

  // Fin de la communication avec la carte
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1(); 

  Serial.println("========================");
}
