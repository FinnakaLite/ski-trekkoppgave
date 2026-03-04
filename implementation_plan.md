# Ski-Trekkoppgave API Implementation Plan

Dette er en plan for å bygge API-et til din skikjøringsapplikasjon, med fokus på Svelte/Vite som frontend og Node.js/TypeScript som backend, basert på dokumentet du har skrevet.

## Mål
Et API for klienten (Svelte) for å hente og redigere brukerens heiskjøringer og kalkulerte ruter, samt en klar struktur for å håndtere databasen med Prisma i et TypeScript-miljø.

## User Review Required
> [!IMPORTANT]
> Prosjektet ditt bruker i dag standard Node.js (JavaScript) og express-generator oppsett ([app.js](file:///c:/Users/finng/Documents/GitHub/ski-trekkoppgave/backend/app.js), `routes/`).
> I planen foreslår jeg at vi migrerer backenden til å bruke TypeScript over Node.js, ettersom dette var et krav i tech-stacken din. Dette krever at vi setter opp `tsconfig.json`, `tsc` e.l. og konverterer filene, eller setter opp en ny src-mappe for TypeScript. Er dette greit?

## Architectur & Database
- **Database:** Prisma ORM med eksisterende PostgreSQL schema som definert.
- **Relasjoner:** Som nevnt i konseptet ditt er det ingen strikte `relation` felter (foreign keys) mellom `Heissystem` og de kalkulerte listene (`Turer`, `Heis_Turer`), for å tillate separert manuell data-importering eller asynkront script som kjører hver time.

## Proposed Changes

### 1. Migrere/Konfigurere TypeScript i Backend
Vi trenger å ombygge strukturen for å støtte Typescript Express backend:

#### [NEW] `backend/tsconfig.json`
Konfigurasjon for å bygge TypeScript til JS (f.eks., target til ES2022, outDir til `dist/`).

#### [NEW] `backend/src/app.ts` og `backend/src/server.ts`
Erstatter [backend/app.js](file:///c:/Users/finng/Documents/GitHub/ski-trekkoppgave/backend/app.js) og [backend/bin/www](file:///c:/Users/finng/Documents/GitHub/ski-trekkoppgave/backend/bin/www) for å bruke TypeScript og ES Modules importer.

### 2. API Ruter

Vi baserer API-et på kravene A, B, og C. Siden oppdatering (C) kan skje basert på gjestens egen innsats, legges API rutene opp med Express "Controllers".

#### Rute A: Get Heis Turer
- **Endpoint:** `POST /api/rides/lifts` eller `GET /api/rides/lifts`
  - *Merk:* Vanligvis brukes `GET` for å hente data. Vi kan sende `cardSerial` i query params: `?cardSerial=XYZ&dateFrom=...&dateTo=...`
- **Request:** Query params `cardSerial` (required), `dateFrom` (optional), `dateTo` (optional)
- **Response:**
  ```json
  [
    {
      "heisTurid": 1,
      "timeStart": "2023-12-01T10:00:00Z",
      "heis": "L1",
      "lengde": 1500
    }
  ]
  ```

#### Rute B: Get Turer (Kalkulerte Ruter)
- **Endpoint:** `GET /api/rides/routes`
- **Request:** Query params `cardSerial` (required), `dateFrom` (optional), `dateTo` (optional)
- **Response:**
  ```json
  [
    {
      "turID": 1,
      "timeFirstLift": "2023-12-01T10:00:00Z",
      "timeEndLift": "2023-12-01T10:15:00Z",
      "route": ["B1", "B5"]
    }
  ]
  ```

#### Rute C: Update Tur (Redigere Ruter)
- **Endpoint:** `PUT /api/rides/routes/:turID`
- **Request Body (JSON):**
  ```json
  {
    "cardSerial": "XYZ",
    "nyRoute": ["B1", "B6"]
  }
  ```
- **Response:** `204 No Content` eller `200 OK`. `NyRoute` vil erstattes inn i Databasens model (`Turer.route`).
- **Verifisering:** API sjekker database om `Turer` med `:turID` faktisk tilhører `cardSerial` i Request Body, før endringen utføres.

### 3. Chron Service for Kalkulering
Du nevnte at kalkulering (estimering av ruter basert på tid) skjer manuelt el. 1 gang i timen.
- **Plan:** Vi kan enten sette opp en Node.js intern `setInterval` (eller `node-cron` package) funksjon i backenden for å foreta datauthenting og synkronisering fra `Heissystem` til `Heis_Turer` og `Turer`, eller dette kan bygges som et separat script avhengig av din preferanse.

## Verification Plan
### Manual Verification
1. Skrive en test script i frontenden / postman for å slå opp `GET /api/rides/lifts?cardSerial=TEST`.
2. Sjekke at Prisma kobler til PostgreSQL serveren din riktig.
3. Teste oppdatering med en PUT request for å sikre at ruten endrer seg, og at du ikke får lov til å endre noen annens `cardSerial`.
