<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-22c55e?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Version-2.0.0-0ea5e9?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-8b5cf6?style=for-the-badge" />
</p>

<h1 align="center">🚦 SAHTCS</h1>
<h3 align="center">Human-Aware Smart Traffic Signal System</h3>

<p align="center">
  An AI-powered adaptive intersection management system that uses <b>Reinforcement Learning</b>,
  real-time density detection, pedestrian prioritization, and emergency vehicle override
  to optimize traffic flow — with a stunning live simulation dashboard.
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-demo-scenarios">Demo Scenarios</a> •
  <a href="#-ai-engine">AI Engine</a> •
  <a href="#-api">API</a> •
  <a href="#-tech-stack">Tech Stack</a>
</p>

---

## 📖 About

**SAHTCS** (Smart Adaptive Human-aware Traffic Control System) is a simulation-based smart traffic signal system designed for real-world smart city deployment. It models a 4-way intersection with:

- **Vehicle density detection** per direction
- **Pedestrian flow management** with dedicated crossing phases
- **Emergency vehicle override** with instant green corridor activation
- **Adaptive AI signal timing** that improves over time using Q-Learning

The system features a **professional-grade SaaS dashboard** with real-time charts, an animated intersection simulator showing traffic flow, AI prediction panels, and 7 pre-built demo scenarios for presentations.

> 💡 This project is ideal for **hackathons**, **final year projects**, **smart city demos**, and **research presentations**.

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** v16 or higher → [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern browser (Chrome, Firefox, Edge)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/sahtcs.git

# 2. Navigate to the project folder
cd sahtcs

# 3. Install dependencies
npm install

# 4. Start the server
npm start
```

### Open in Browser

| Page | URL |
|------|-----|
| 🏠 **Landing Page** | [http://localhost:5000](http://localhost:5000) |
| 📊 **Dashboard** | [http://localhost:5000/dashboard](http://localhost:5000/dashboard) |
| 💚 **API Health** | [http://localhost:5000/api/health](http://localhost:5000/api/health) |

That's it! The dashboard will load with default traffic data and the AI engine will be ready to run.

---

## 🎯 Features

### Core Intelligence
| Feature | Description |
|---------|-------------|
| 🧠 **Adaptive AI Engine** | Multi-factor priority scoring with 7+ weighted factors per direction |
| 🚶 **Pedestrian Protection** | Dedicated crossing phases with group dynamics and urgency-based timing |
| 🚑 **Emergency Override** | Instant green corridor for ambulances, fire trucks, and police |
| 🤖 **Reinforcement Learning** | Q-Learning algorithm that improves signal timing with every cycle |
| 🔮 **Traffic Prediction** | 5-minute forecasting using weighted moving average and trend analysis |
| ⚖️ **Starvation Prevention** | No direction waits more than N cycles — fairness is enforced |

### Dashboard
| Feature | Description |
|---------|-------------|
| 🛣️ **Live Intersection** | Animated simulation with realistic vehicles (headlights, taillights, siren effects) |
| 📈 **Real-Time Charts** | Traffic density over time, wait time bars, distribution doughnut (Chart.js) |
| 🗺️ **Density Heatmap** | Canvas-based color-coded heatmap showing congestion zones |
| 📊 **Performance Metrics** | Avg wait time, throughput, efficiency %, cycle count |
| 📋 **Decision Log** | Timestamped feed of every AI decision with reasoning |
| 🔔 **Emergency Alerts** | Toast notifications when emergency vehicles are detected |
| 🕹️ **Manual Controls** | Range sliders to adjust vehicle/pedestrian counts per direction |
| 🎯 **Demo Scenarios** | 7 pre-built scenarios with one-click activation |

### Simulation Details
| Feature | Description |
|---------|-------------|
| 🚗 **Vehicle Types** | Cars (5 colors), buses, trucks, ambulances, fire trucks, police |
| 💡 **Headlights & Taillights** | Realistic vehicle lighting with glow effects |
| 🚨 **Siren Animation** | Emergency vehicles flash red/blue siren lights |
| 🚶 **Walking Pedestrians** | Animated pedestrians with body movement |
| 🟢 **Green Corridor** | Visual overlay showing the emergency vehicle's cleared path |
| 🚦 **Realistic Signals** | 3-light housings with radial glow, pulsing animations |
| ➡️ **Traffic Flow** | Vehicles on green signal animate through the intersection |

---

## 🎮 Demo Scenarios

Click any scenario button on the dashboard to instantly load a pre-configured traffic situation:

| # | Scenario | Icon | What It Shows |
|---|----------|------|---------------|
| 1 | **Balanced Flow** | ⚖️ | Equal traffic on all roads — AI balances green time fairly |
| 2 | **Heavy Traffic** | 🚗 | Rush hour congestion — AI optimizes throughput |
| 3 | **Pedestrian Rush** | 🚶 | School zone / event — AI extends pedestrian crossing phases |
| 4 | **Emergency: Ambulance** | 🚑 | Ambulance approaching — instant green corridor override |
| 5 | **Dual Emergency** | 🚨 | Two emergency vehicles at once — AI resolves the conflict |
| 6 | **Peak Hour Chaos** | ⏰ | Maximum stress — high density + multiple emergencies |
| 7 | **Night Mode** | 🌙 | Low traffic — AI uses shorter cycles and energy saving mode |

### How to Use During a Presentation

1. Open the dashboard at `http://localhost:5000/dashboard`
2. Click **"Emergency: Ambulance"** → watch the green corridor activate and vehicles clear
3. Click **"Auto Cycle"** → watch the AI handle random traffic in real-time
4. Adjust sliders manually → show how the AI adapts to changing conditions
5. Switch to **"Peak Hour Chaos"** → demonstrate conflict resolution under extreme load

---

## 🧠 AI Engine

The AI engine consists of **5 modular sub-systems** that work together:

### 1. Priority Calculator (`priority-calculator.js`)
Calculates a weighted score for each direction every cycle:

```
Score = (vehicles × 5 × timeOfDayFactor)
      + (pedestrians^1.3 × 4)              ← non-linear urgency
      + (waitTime × 0.25 to 0.5)           ← exponential for long waits
      + emergencyBonus (0 / 120 / 170 / 200)
      + starvationPenalty (8 per skipped cycle)
      + fairnessBonus (3 per skipped cycle)
      - recentGreenPenalty (8 if was just green)
```

The highest-scoring direction gets green.

### 2. Emergency Handler (`emergency-handler.js`)
- Detects emergency vehicles from all 4 directions
- Immediately overrides normal scoring
- Resolves conflicts: Ambulance (200) > Fire Truck (170) > Police (120)
- Activates visual green corridor on the intersection
- Triggers toast alert notifications

### 3. Pedestrian Model (`pedestrian-model.js`)
- Calculates crossing time: `base (10s) + groupDelay (0.5s per person) + safety (3s)`
- Activates dedicated pedestrian phases when count ≥ 10
- Returns urgency factor for priority scoring

### 4. Prediction Engine (`prediction-engine.js`)
- Records traffic history (last 30 data points per direction)
- Uses **Weighted Moving Average** with trend momentum
- Predicts vehicle count 5 minutes ahead
- Shows trend arrows: ↑ Rising / ↓ Falling / → Stable
- Confidence score increases with more data (40% → 95%)

### 5. RL Simulator (`rl-simulator.js`)
- **Q-Learning** with epsilon-greedy exploration
- State space: Quantized traffic pattern → 4-bucket vehicle density, 3-bucket pedestrians, emergency flag, 3-bucket wait time
- Reward shaping: +2 per vehicle cleared, +50 for emergency handling, penalties for ignoring congestion
- Exploration rate decays from 15% → 5% over time
- Learning progress tracked and displayed in the dashboard

---

## 📁 Architecture

```
sahtcs/
├── config/
│   └── .env                        # Environment configuration
│
├── public/                         # Frontend (served as static files)
│   ├── index.html                  # Landing page (hero, features, CTA)
│   ├── dashboard.html              # Main dashboard (simulation + analytics)
│   │
│   ├── css/
│   │   ├── variables.css           # Design tokens (100+ CSS variables)
│   │   ├── base.css                # Reset, typography, scrollbar, utilities
│   │   ├── components.css          # Glass cards, buttons, sliders, badges, toasts
│   │   ├── animations.css          # 20+ keyframe animations
│   │   ├── intersection.css        # Roads, vehicles, signals, pedestrians
│   │   ├── landing.css             # Hero section, features grid, CTA
│   │   └── dashboard.css           # Dashboard layout, panels, charts
│   │
│   ├── js/
│   │   ├── app.js                  # Entry point — bootstraps DashboardController
│   │   │
│   │   ├── engine/                 # 🧠 AI Core
│   │   │   ├── traffic-engine.js   # Main orchestrator (coordinates all sub-modules)
│   │   │   ├── priority-calculator.js  # Multi-factor scoring algorithm
│   │   │   ├── emergency-handler.js    # Green corridor & conflict resolution
│   │   │   ├── pedestrian-model.js     # Crosswalk timing & urgency
│   │   │   ├── prediction-engine.js    # Traffic flow forecasting
│   │   │   └── rl-simulator.js         # Q-Learning reinforcement learning
│   │   │
│   │   ├── ui/                     # 🎨 UI Modules
│   │   │   ├── dashboard-controller.js # Central controller (binds everything)
│   │   │   ├── intersection-renderer.js # Vehicle/signal/pedestrian rendering
│   │   │   ├── chart-manager.js        # 4 Chart.js charts
│   │   │   ├── heatmap-renderer.js     # Canvas-based density heatmap
│   │   │   ├── notification-manager.js # Toast alerts & decision log
│   │   │   └── scenario-manager.js     # Scenario loading & control sync
│   │   │
│   │   ├── data/                   # 📦 Configuration & Data
│   │   │   ├── config.js           # Tunable algorithm parameters
│   │   │   └── scenarios.js        # 7 pre-built demo scenarios
│   │   │
│   │   └── utils/                  # 🔧 Utilities
│   │       ├── dom-helpers.js      # DOM query/create helpers
│   │       └── formatters.js       # Number/time/color formatting
│   │
│   └── assets/
│       └── icons/                  # (placeholder for custom assets)
│
├── server.js                       # Express server with API routes
├── package.json                    # Dependencies & scripts
└── README.md                       # This file
```

### Module Dependency Flow

```
app.js
  └── DashboardController
        ├── TrafficEngine (AI Core)
        │     ├── PriorityCalculator
        │     ├── EmergencyHandler
        │     ├── PedestrianModel
        │     ├── PredictionEngine
        │     └── RLSimulator
        ├── IntersectionRenderer
        ├── ChartManager (Chart.js)
        ├── HeatmapRenderer (Canvas)
        ├── NotificationManager
        └── ScenarioManager
```

---

## 🌐 API

The Express server exposes a lightweight REST API:

### `GET /api/health`
Returns server status and uptime.
```json
{
  "status": "online",
  "version": "2.0.0",
  "uptime": 3421.53,
  "timestamp": "2026-04-04T07:30:00.000Z"
}
```

### `GET /api/config`
Returns current simulation configuration.
```json
{
  "simulationSpeed": 1,
  "aiEnabled": true,
  "demoMode": true
}
```

### `POST /api/log`
Log a decision event (for analytics/persistence).
```json
{
  "road": "north",
  "score": 87.5,
  "cycleTime": 35,
  "type": "algorithmic"
}
```

### `GET /api/log?limit=50`
Retrieve the latest decision log entries.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vanilla HTML5, CSS3, ES6 Modules | Zero-dependency, fast, portable |
| **Charts** | [Chart.js 4.x](https://www.chartjs.org/) | Density, wait time, distribution, gauge |
| **Heatmap** | HTML5 Canvas API | Custom traffic density visualization |
| **Backend** | [Express.js](https://expressjs.com/) | Static serving + REST API |
| **Security** | [Helmet.js](https://helmetjs.github.io/) | HTTP security headers |
| **Logging** | [Morgan](https://github.com/expressjs/morgan) | Request logging |
| **Config** | [dotenv](https://github.com/motdotla/dotenv) | Environment configuration |
| **CORS** | [cors](https://github.com/expressjs/cors) | Cross-origin requests |

---

## ⚙️ Configuration

Edit `config/.env` to customize behavior:

```env
PORT=5000                     # Server port
NODE_ENV=development          # development / production
SIMULATION_SPEED=1            # Default simulation speed multiplier
AI_PREDICTION_ENABLED=true    # Enable/disable prediction engine
DEMO_MODE=true                # Enable demo mode features
LOG_LEVEL=info                # Logging verbosity
```

### Algorithm Tuning

Edit `public/js/data/config.js` to tune the AI weights:

```javascript
WEIGHTS: {
  VEHICLE_DENSITY: 5,          // How much vehicles matter
  PEDESTRIAN_DENSITY: 4,       // How much pedestrians matter
  WAITING_TIME: 0.25,          // Wait time influence
  STARVATION_PENALTY: 8,       // Penalty per skipped cycle
  FAIRNESS_BONUS: 3,           // Bonus for skipped roads
  PREDICTION_WEIGHT: 2,        // Future traffic influence
  RL_MODIFIER: 1.0,            // Reinforcement learning adjustment
}
```

---

## 🧪 How to Use

### Manual Mode
1. Open the dashboard
2. Adjust the **sliders** (Vehicles, Pedestrians, Wait Time) for each direction
3. Select an **emergency vehicle** from the dropdown (optional)
4. Click **"▶ Run Decision"** — the AI analyzes and picks the best signal
5. Watch the intersection update: green signal, vehicles move through, scores change

### Auto Cycle Mode
1. Click **"⟳ Auto Cycle"** — the system generates random traffic every 2.5 seconds
2. Adjust **speed** using the 1× / 2× / 5× / 10× buttons
3. Watch charts fill up with real-time data
4. The RL algorithm learns and improves over time (check the RL panel)
5. Click **"⏹ Stop"** to pause

### Demo Scenarios
1. Click any **scenario button** (e.g., "🚑 Emergency")
2. The sliders auto-update and a decision runs immediately
3. Read the **narration text** below the intersection for AI explanation
4. Compare different scenarios to see how the AI adapts

---

## 📊 Dashboard Panels Explained

| Panel | What It Shows |
|-------|---------------|
| **Performance Metrics** | 4 KPI cards — Avg Wait, Throughput, Efficiency %, Cycles |
| **HUD Cards** | Live vehicle/pedestrian/emergency count per direction with signal dot |
| **Intersection** | Visual simulation with roads, vehicles, signals, pedestrians |
| **AI Decision** | Which road got green, cycle time, and the reasoning explanation |
| **Priority Scores** | Animated bars comparing all 4 direction scores (winner highlighted in green) |
| **Efficiency Gauge** | Doughnut chart showing overall system performance |
| **Density Chart** | Line chart tracking vehicle density over time for all 4 directions |
| **Wait Time Chart** | Bar chart comparing current wait times |
| **AI Prediction** | 5-minute forecast per direction with trend arrows and confidence % |
| **Traffic Distribution** | Doughnut chart showing traffic split across directions |
| **RL Learning** | Episodes count, states explored, avg reward, progress bar |
| **Density Heatmap** | Color-coded grid showing where congestion is concentrated |
| **Decision Log** | Scrollable feed of every AI decision with timestamps |

---

## 🚀 Deployment

### Option 1: Run Locally
```bash
npm start
```

### Option 2: Deploy to a Server
```bash
# Set production mode
NODE_ENV=production node server.js

# Or with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name sahtcs
```

### Option 3: Docker (optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
docker build -t sahtcs .
docker run -p 5000:5000 sahtcs
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

---

<p align="center">
  <b>Built with 🧠 AI & ❤️ for smart cities</b><br/>
  <sub>SAHTCS — Making intersections intelligent, one signal at a time.</sub>
</p>
