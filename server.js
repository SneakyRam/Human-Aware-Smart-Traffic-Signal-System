const express = require("express");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

require("dotenv").config({ path: path.join(__dirname, "config", ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,  // Allow inline scripts & CDN
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Routes ───

// Landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ─── API Layer ───

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    version: "2.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Simulation config
app.get("/api/config", (req, res) => {
  res.json({
    simulationSpeed: Number(process.env.SIMULATION_SPEED) || 1,
    aiEnabled: process.env.AI_PREDICTION_ENABLED === "true",
    demoMode: process.env.DEMO_MODE === "true",
  });
});

// Analytics endpoint (placeholder for future DB integration)
let decisionLog = [];

app.post("/api/log", (req, res) => {
  const entry = {
    ...req.body,
    timestamp: new Date().toISOString(),
  };
  decisionLog.push(entry);
  if (decisionLog.length > 500) decisionLog.shift();
  res.json({ success: true });
});

app.get("/api/log", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  res.json(decisionLog.slice(-limit));
});

// ─── Error Handling ───
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Start ───
app.listen(PORT, () => {
  console.log(`\n🚦 SAHTCS Server running at http://localhost:${PORT}`);
  console.log(`   Dashboard:  http://localhost:${PORT}/dashboard`);
  console.log(`   API Health:  http://localhost:${PORT}/api/health\n`);
});
