# Federated SAGINs Orchestrator - PoC #3

[![Vercel Deployment](https://img.shields.io/vercel/deployment/ailabteam/federated-sagin-orchestrator?style=for-the-badge&logo=vercel)](https://federated-sagin-orchestrator.vercel.app/)
[![GitHub stars](https://img.shields.io/github/stars/ailabteam/federated-sagin-orchestrator?style=for-the-badge&logo=github)](https://github.com/ailabteam/federated-sagin-orchestrator/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/ailabteam/federated-sagin-orchestrator?style=for-the-badge&logo=github)](https://github.com/ailabteam/federated-sagin-orchestrator/issues)

**Live Demo: [federated-sagin-orchestrator.vercel.app](https://federated-sagin-orchestrator.vercel.app/)**

---

## 🌐 About This Project

This project is the third, and most ambitious, Proof-of-Concept (PoC) in my research series. The **Federated SAGINs Orchestrator** is an interactive dashboard that visualizes a complete **Federated Learning (FL)** process in a simulated Satellite-Ground Integrated Network (SAGINs).

The core objective is to demonstrate how a powerful, generalized AI model can be trained collaboratively across decentralized clients (e.g., ships, ground stations, IoT devices) **without ever centralizing their private data**. This addresses key challenges in modern AI, including data privacy, security, and bandwidth constraints.

### The Simulation Story:
1.  **Start Training:** A central orchestrator (simulated as a GEO satellite) initiates a 100-round training process.
2.  **Client Selection:** In each round, a random subset of clients is selected to participate. These clients are highlighted in the Network View.
3.  **Local Training (Simulated):** The demo replays a pre-computed training history where each client trained a model on its local, private, and highly biased (Non-IID) dataset.
4.  **Aggregation & Improvement:** The orchestrator combines the learnings from these clients.
5.  **Live Visualization:** The dashboard plots the global model's accuracy in real-time, showcasing its gradual improvement from random guessing (~10%) to a significantly more intelligent state (~35-40%), proving the effectiveness of the FL process.

---

## 🎥 Video Demonstration

A detailed walkthrough of the dashboard, the Federated Learning concept, and the underlying system architecture is available on YouTube.

[![YouTube Demo Video Thumbnail](https://img.youtube.com/vi/vhUEbGM_goQ/0.jpg)](https://www.youtube.com/watch?v=vhUEbGM_goQ)


---

## 🏛️ Architecture

This PoC utilizes a refined version of the hybrid architecture, demonstrating its capability to manage long-running, stateful background tasks.

-   **Frontend (React on Vercel):** A dynamic dashboard built with React, TypeScript, React Flow (for the network graph), and Recharts (for the accuracy plot).
-   **Proxy Gateway (Vercel Serverless):** A lightweight FastAPI proxy with two endpoints:
    -   `/api/start-training`: To initiate the background simulation on the compute server.
    -   `/api/get-status`: To periodically poll for the latest training progress.
-   **Compute Server (Dedicated GPU Server):** The core of the simulation, responsible for:
    -   Running the full, offline Federated Learning simulation using **Flower (`flwr`)** and **PyTorch** to generate the training history.
    -   Serving a "Demo Mode" FastAPI API that replays the pre-computed history, managing the simulation state and providing progress updates via background tasks.

---

## ✨ Features

-   **Interactive Dashboard:** A professional 3-panel layout providing context, network visualization, and results.
-   **Live Network Visualization:** A `React Flow` graph that highlights the active clients in each training round.
-   **Real-time Accuracy Plot:** A `Recharts` line chart that animates the global model's accuracy growth round by round.
-   **Stateful Simulation:** A "Start Training" button that initiates and tracks a long-running process, providing a realistic demo experience.
-   **Clear Explanations:** An integrated "About" panel explaining the concept and steps of Federated Learning.

---

## 🚀 Getting Started

This project consists of the Vercel-deployable application and the offline Compute Server.

### Vercel Application (This Repository)
-   Contains the React frontend, the FastAPI proxy (`/api`), and all Vercel configurations.
-   Ready to be deployed directly from this repository.

### Compute Server (Offline Setup)
-   **Location:** The code for the compute server (`prepare_data.py`, `simulation.py`, `main.py`) is managed locally and is not part of this repository.
-   **Key Steps:**
    1.  Create a dedicated Conda environment (`poc_fl`).
    2.  Install dependencies: `pytorch`, `flwr[simulation]`, `fastapi[all]`, etc.
    3.  Run `simulation.py` to generate the full training history and verify the FL process.
    4.  Update the `TRAINING_HISTORY_DATA` array in `main.py` with the results.
    5.  Run the "Demo Mode" FastAPI server `main.py` on an open port (e.g., `8888`).

---

## 🤝 Collaboration

Federated Learning is a rapidly evolving field. I welcome discussions, feedback, and collaboration opportunities. Please feel free to open an issue or connect with me through my professional channels.

---
_This project is part of a personal R&D initiative by [Do Phuc Hao](https://github.com/ailabteam)._
