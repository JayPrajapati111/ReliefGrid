# ReliefGrid

**Intelligent & Transparent Disaster Relief Resource Allocation**

Built for **Elevate 1.0** (DJSCE / DJS NSDC), Problem Statement **EL-02**.

ReliefGrid is a tactical allocation hub that simulates a monsoon flood disaster in Mumbai and dispatches ambulances to critical patient clusters and hospitals. Every dispatch decision is explained, so operators can see why a resource was assigned where it was.

## Features

- **Command Center:** live simulation with tick counter, speed control (1x / 2x / 5x / Max) and pause or hold.
- **Telemetry canvas:** map of Mumbai Sector 4 showing hospitals, ambulances, patient clusters and flooded or blocked roads.
- **Allocation engine:** assigns ambulances to clusters and hospitals using a Hungarian-style assignment with shortest-path routing (Dijkstra / A*), including bypass routes around blocked roads.
- **Explainability log:** each dispatch shows priority score, free ICU beds and transit time, with a weight matrix and alternatives.
- **Event injector:** stress-test the system with live events such as road blocked, hospital saturated, fleet failure, mass surge, blood stock depleted and ledger delay.
- **Resource and ledger view:** track resources and a ledger anchor for transparency.
- **Role-based views:** command center / admin, field and hospital portals.
- **Scenario timeline, architecture and report pages.**

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Recharts

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS, v18 or newer)

### Run locally

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux

npm install --legacy-peer-deps
npm run dev
```

Open the URL shown in the terminal (for example `http://localhost:3000`).

### Environment variables

Copy `.env.example` to `.env` and fill in any values listed there. Never commit your `.env` file.

## Project Structure

```
.
├── src/              # application source
├── index.html        # entry HTML
├── vite.config.ts    # Vite configuration
├── tsconfig.json     # TypeScript configuration
├── package.json
└── .env.example
```

## Hackathon

Elevate 1.0, Dwarkadas J. Sanghvi College of Engineering (DJS NSDC), EL-02: Intelligent & Transparent Disaster Relief Resource Allocation.
