# StandlRadar

StandlRadar ist eine mobile React-Native-App zum Finden von Hendlgrillern und
Steckerlfisch-Standln in Österreich. Standl können gesucht, gefiltert, auf einer
Karte angezeigt und als Favoriten gespeichert werden. Eingeloggte
Nutzer*innen können zusätzlich Likes vergeben und neue Standl vorschlagen.

Standl-Besitzer*innen können die Owner-Rolle aktivieren, Standl übernehmen oder
neu erstellen sowie deren Standorte und Standzeiten verwalten.

## Funktionen

### Gäste

- Standl suchen und filtern
- aktuell geöffnete Standorte anzeigen
- Standl und Standorte auf einer Karte finden
- Standzeiten und Öffnungsstatus einsehen
- externe Navigation starten
- Favoriten lokal speichern

### Eingeloggte Nutzer*innen

- alle Gastfunktionen
- Standl liken
- Favoriten mit Firestore synchronisieren
- neue Standl vorschlagen
- Owner-Rolle aktivieren

### Owner

- alle Nutzerfunktionen
- bestehende Standl übernehmen
- eigene Standl erstellen und durchsuchen
- Name und Kategorie bearbeiten
- mehrere Standorte verwalten
- Standzeiten im 24-Stunden-Format festlegen

## Technologien

- React Native und Expo SDK 54
- TypeScript
- Expo Router
- Firebase Authentication
- Cloud Firestore
- React Native Maps
- Expo Location
- AsyncStorage
- React Native Community DateTimePicker

## Voraussetzungen

- Node.js ab Version 20.19
- npm
- Git
- Android-Gerät mit Expo Go
- Firebase-Projekt mit Authentication und Firestore

Die Anwendung wurde hauptsächlich auf Android entwickelt und getestet.

## Installation

Repository klonen und Projektordner öffnen:

```bash
git clone <REPOSITORY-URL>
cd standlradar
```

Abhängigkeiten installieren:

```bash
npm install
```

## Firebase einrichten

1. In der [Firebase Console](https://console.firebase.google.com/) ein Projekt
   erstellen.
2. Eine Web-App innerhalb des Firebase-Projekts registrieren.
3. Unter **Authentication → Sign-in method** die Anmeldung mit
   E-Mail und Passwort aktivieren.
4. Eine Cloud-Firestore-Datenbank erstellen.
5. Die Datei `.env.example` als `.env` kopieren.
6. Die Firebase-Werte der registrierten Web-App in `.env` eintragen:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Die Datei `.env` enthält die projektspezifische Konfiguration und darf nicht in
das Repository eingecheckt werden.

## Firestore Security Rules

Die Firestore-Regeln befinden sich in `firestore.rules`.

Für das Studentenprojekt können sie über die Firebase Console veröffentlicht
werden:

1. **Firestore Database → Rules** öffnen.
2. Den Inhalt aus `firestore.rules` einfügen.
3. Die Regeln veröffentlichen.

Die Regeln erlauben öffentliche Lesezugriffe auf Standl-Daten, schützen jedoch
Profile, Favoriten, Likes und Owner-Verwaltungsfunktionen.

## App starten

Entwicklungsserver starten:

```bash
npm start
```

Anschließend:

1. Expo Go auf dem Android-Gerät öffnen.
2. Den im Terminal angezeigten QR-Code scannen.
3. Standortzugriff erlauben, wenn Entfernungen und die eigene Kartenposition
   verwendet werden sollen.

Rechner und Smartphone sollten sich im selben Netzwerk befinden. Falls die
Verbindung nicht funktioniert, kann Expo im Tunnel-Modus gestartet werden:

```bash
npx expo start --tunnel
```

## Weitere Befehle

```bash
# Android-Start mit eingerichtetem Emulator oder verbundenem Gerät
npm run android

# Web-Version starten
npm run web

# TypeScript prüfen
npx tsc --noEmit
```

## Projektstruktur

```text
app/          Screens und Expo-Router-Routen
components/   Wiederverwendbare UI-Komponenten
constants/    Farben und Designwerte
contexts/     Globale Zustände
hooks/        Wiederverwendbare Zustands- und Formularlogik
lib/          Firebase-Services und Hilfsfunktionen
types/        Gemeinsame TypeScript-Datentypen
assets/       Bilder, Icons und Kartenmarker
```

## Firestore-Datenmodell

```text
users/{userId}
└── favorites/{standlId}

standl/{standlId}
├── likes/{userId}
└── locations/{locationId}
    └── schedules/{scheduleId}
```

Ein Standl kann mehrere Standorte besitzen. Jeder Standort kann eigene
Wochentage und Standzeiten enthalten.

## Hinweise

- Die Owner-Rolle kann nicht wieder auf eine normale Nutzerrolle zurückgesetzt
  werden.
- Owner-Accounts werden nicht extern verifiziert.
- Preislisten, Bild-Uploads, Benachrichtigungen und temporäre Schließungen sind
  mögliche spätere Erweiterungen.


## Qualitätssicherung

Das Projekt wurde manuell auf Android getestet. Zusätzlich werden
TypeScript-Prüfungen mit folgendem Befehl durchgeführt:

```bash
npx tsc --noEmit
```

