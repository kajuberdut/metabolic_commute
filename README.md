# Metabolic Commute SPA

This repository contains the source code and specifications for the **Metabolic Commute** Single Page Application (SPA).

## Overview

The "Metabolic Commute" is a simple, offline-capable HTML5 utility designed for a Work-From-Home (WFH) developer. It facilitates a specific "REHIT" (Reduced Exertion HIIT) and Heat exposure protocol to optimize metabolic health with minimal time commitment.

## Directory Contents

*   **`index.html`**: The main entry point for the application. It acts as the "Manifesto Ledger" outlining the weekly schedule and protocols, and includes fully functional tools:
    *   **REHIT Timer**: A sequence timer for the Sprint protocol.
    *   **Box Breather**: A visual pacer for breathing exercises.
    *   **Kettlebell Tracker**: A placeholder for strength protocols (Included / Locked).

## Philosophy

The project prioritizes simplicity and sustainability to improve metabolic health with minimal time commitment. It is designed to act as a "fake commute" to separate home life from work mode, using physiological triggers (intense exertion or heat) to shift mental states.

## Deployment

Run locally with Docker Compose:

```bash
docker compose up -d
```

The app will be available at `http://localhost:8080`. Configure the port in `.env`.
