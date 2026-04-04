// ============================================
// SAHTCS — Prediction Engine
// Simulated traffic flow forecasting
// ============================================

import CONFIG from '../data/config.js';
import { clamp, randomInt } from '../utils/formatters.js';

export class PredictionEngine {
  constructor() {
    this.history = { north: [], south: [], east: [], west: [] };
    this.predictions = { north: 0, south: 0, east: 0, west: 0 };
    this.trends = { north: 'stable', south: 'stable', east: 'stable', west: 'stable' };
    this.confidence = 0.7;
  }

  /**
   * Record current traffic state for learning.
   */
  recordState(allData) {
    CONFIG.DIRECTIONS.forEach(dir => {
      this.history[dir].push({
        vehicles: allData[dir].vehicles,
        pedestrians: allData[dir].pedestrians,
        timestamp: Date.now(),
      });

      // Keep bounded
      if (this.history[dir].length > 30) {
        this.history[dir].shift();
      }
    });
  }

  /**
   * Generate 5-minute traffic predictions per direction.
   * Uses simple weighted moving average with simulated noise.
   */
  predict() {
    CONFIG.DIRECTIONS.forEach(dir => {
      const h = this.history[dir];
      if (h.length < 3) {
        this.predictions[dir] = h.length > 0 ? h[h.length - 1].vehicles : 0;
        this.trends[dir] = 'stable';
        return;
      }

      // Weighted moving average (recent data weighted more)
      const recent = h.slice(-5);
      let weightedSum = 0;
      let totalWeight = 0;

      recent.forEach((entry, i) => {
        const weight = (i + 1) * 2;
        weightedSum += entry.vehicles * weight;
        totalWeight += weight;
      });

      const wma = weightedSum / totalWeight;

      // Add trend momentum
      const last3 = h.slice(-3).map(e => e.vehicles);
      const trendSlope = (last3[2] - last3[0]) / 2;

      // Predicted value with momentum
      const predicted = wma + trendSlope * 1.5 + (Math.random() - 0.5) * 2;
      this.predictions[dir] = clamp(Math.round(predicted), 0, 25);

      // Determine trend
      if (trendSlope > 1) this.trends[dir] = 'up';
      else if (trendSlope < -1) this.trends[dir] = 'down';
      else this.trends[dir] = 'stable';
    });

    // Update confidence based on history length
    const avgLen = CONFIG.DIRECTIONS.reduce(
      (s, d) => s + this.history[d].length, 0
    ) / 4;
    this.confidence = clamp(0.4 + avgLen * 0.02, 0.4, 0.95);

    return {
      predictions: { ...this.predictions },
      trends: { ...this.trends },
      confidence: this.confidence,
    };
  }

  /**
   * Get prediction influence for priority scoring.
   */
  getPredictionInfluence(direction) {
    const predicted = this.predictions[direction];
    const trend = this.trends[direction];

    // If traffic is predicted to increase, boost current priority
    if (trend === 'up') return predicted * 0.3;
    if (trend === 'down') return -predicted * 0.15;
    return 0;
  }

  /**
   * Get formatted prediction data for UI.
   */
  getPredictionDisplay() {
    return CONFIG.DIRECTIONS.map(dir => ({
      direction: dir,
      predicted: this.predictions[dir],
      trend: this.trends[dir],
      trendIcon: this.trends[dir] === 'up' ? '↑' : this.trends[dir] === 'down' ? '↓' : '→',
      confidence: this.confidence,
    }));
  }

  reset() {
    this.history = { north: [], south: [], east: [], west: [] };
    this.predictions = { north: 0, south: 0, east: 0, west: 0 };
    this.trends = { north: 'stable', south: 'stable', east: 'stable', west: 'stable' };
    this.confidence = 0.7;
  }
}

export default PredictionEngine;
