# Graph Coloring & Invariants Research Studio
An advanced, interactive research platform for analyzing, visualizing, animating, and verifying algebraic graph coloring invariants. Developed with React 19 and Cytoscape.js

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://richi1325.github.io/graph-invariants-visualizer/)

---
## Live Application
Access the live interactive visualizer at:  
👉 **[https://richi1325.github.io/graph-invariants-visualizer/](https://richi1325.github.io/graph-invariants-visualizer/)**

---
## Authors
- **Jose Ricardo Mendoza Villar**
- **Christian Rubio Montiel**

---
## Overview
This research suite provides an interactive computational environment for exploring four fundamental edge-coloring graph invariants:

1. **Achromatic Index** ($\psi'(G)$): An edge coloring such that every pair of distinct color classes $c_i, c_j$ contains at least one pair of adjacent edges sharing a common vertex.
2. **Achromatic Arboricity** ($a_a(G)$): An edge partition where each individual color class forms an acyclic subgraph (forest), while the union of any two distinct color classes $c_i \cup c_j$ MUST contain at least one cycle.
3. **Pseudoachromatic Index** ($\psi_s'(G)$): An edge coloring where every pair of distinct color classes has adjacent edges.
4. **Connected Pseudoachromatic Index** ($\psi_{sc}'(G)$): An edge coloring where every pair of distinct color classes has adjacent edges AND the subgraph induced by the union of any two color classes $c_i \cup c_j$ is connected.

---

## Technical Stack

- **Framework**: React 19 + Vite
- **Graph Visualization**: Cytoscape.js core
- **Icons**: Lucide React
- **Styling**: Custom modern dark theme CSS tokens & glassmorphism layout

---

## Commands

```bash
# Install dependencies
npm install

# Run dev server on localhost:5173
npm run dev

# Build production bundle
npm run build

# Deploy to GitHub Pages
npm run deploy
```
