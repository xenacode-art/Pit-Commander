# 🏎️ Pit Commander - AI Race Engineer Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://pitcommander.vercel.app)

> Real-time racing strategy powered by machine learning. Built for Hack the Track 2025 presented by Toyota GR.

Dashboard Screenshot<img width="1288" height="966" alt="image" src="https://github.com/user-attachments/assets/de2acdcb-3379-465c-9bc8-3827f221558a" />


## 🏁 Overview

Pit Commander is an AI-powered race strategy assistant that analyzes telemetry data in real-time to help race engineers make optimal decisions. Using machine learning models trained on Toyota GR Cup race data, it predicts tire degradation, optimizes pit stop timing, and forecasts race outcomes.

**🚀 [Try Live App](https://pit-commander-racing-analytics-535809588363.us-west1.run.app/)**

## ✨ Features

- **Real-Time Dashboard**: Live telemetry streaming (speed, throttle, tire age, fuel)
- **AI Strategy Advisor**: ML-powered pit stop recommendations with confidence scores
- **Caution Flag Optimizer**: Instant decision support during yellow flags
- **What-If Simulator**: Test alternative strategies by rewinding race history
- **Driver Performance Analysis**: Sector-by-sector breakdown with improvement tips

## 🛠️ Tech Stack

**Frontend**
- React 18 + TypeScript
- TailwindCSS for styling
- Recharts for data visualization
- WebSocket client for real-time data

**Backend**
- FastAPI (Python 3.11)
- scikit-learn for ML models
- Pandas for data processing
- WebSocket server for live telemetry

**ML Models**
- Tire Degradation Predictor (Random Forest)
- Pit Strategy Optimizer (Decision Tree + Logic)
- Race Pace Forecaster (Linear Regression)

## 📊 Dataset

Trained on Indianapolis Motor Speedway telemetry data from Toyota GR Cup Series:
- 500,000+ telemetry data points
- 50 laps of race data
- 8 cars tracked simultaneously
- Parameters: speed, throttle, brake pressure, GPS coordinates, tire age, fuel consumption

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/pit-commander.git
cd pit-commander
```

2. **Setup Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API runs on http://localhost:8000
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

4. **Load Sample Data**
```bash
cd backend
python scripts/load_sample_race.py
# Loads Indianapolis race data into memory
```

## 📁 Project Structure
```
pit-commander/
├── frontend/          # React + TypeScript app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API clients
│   │   └── types/        # TypeScript definitions
│   └── public/           # Static assets
├── backend/           # FastAPI Python app
│   ├── app/
│   │   ├── models/       # ML models
│   │   ├── routers/      # API endpoints
│   │   ├── services/     # Business logic
│   │   └── main.py       # App entry point
│   ├── data/             # Race datasets
│   └── notebooks/        # Jupyter analysis
└── docs/              # Documentation
```

## 🎯 Usage

### Real-Time Race Simulation
1. Navigate to Dashboard tab
2. Click "Start Race Simulation"
3. Watch live telemetry stream and AI recommendations
4. Observe strategy alerts when pit windows open

### What-If Analysis
1. Navigate to Simulator tab
2. Use timeline slider to select a lap
3. Click "Pit Now" or "Stay Out" to test strategies
4. Compare predicted outcome vs actual race result

### Driver Performance
1. Navigate to Analysis tab
2. Select car number from dropdown
3. Review sector time heatmap
4. Read AI-generated improvement recommendations

## 🏆 Competition Category

**Real-Time Analytics** - Design a tool that simulates real-time decision-making for a race engineer.

## 📈 Performance Metrics

- **ML Model Accuracy**: 82% for tire degradation prediction (RMSE: 0.3s)
- **API Latency**: <500ms for strategy recommendations
- **WebSocket Throughput**: 2 updates/second, 8 cars simultaneously
- **Frontend Performance**: 60fps UI, Lighthouse score 95+


## 🤝 Team

- **xenacode-art** -  ML engineering, Automation enginerring
- **Dataset**: Toyota GR Cup - Indianapolis Motor Speedway

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Toyota Gazoo Racing for providing race data
- Hack the Track 2025 hackathon organizers
- scikit-learn and FastAPI communities

## 📧 Contact

For questions about this project:
- **Email**: coolxena1@gmail.com
- **LinkedIn**:(https://www.linkedin.com/in/erik-obinna-6a937720a)

---

Built with ❤️ for [Hack the Track 2025](https://trddev.com/hackathon-2025) presented by Toyota GR
