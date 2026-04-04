// ============================================
// SAHTCS — Traffic Engine (Main Orchestrator)
// Coordinates all AI sub-modules
// ============================================

import CONFIG from '../data/config.js';
import { PriorityCalculator } from './priority-calculator.js';
import { EmergencyHandler } from './emergency-handler.js';
import { PedestrianModel } from './pedestrian-model.js';
import { PredictionEngine } from './prediction-engine.js';
import { RLSimulator } from './rl-simulator.js';

export class TrafficEngine {
  constructor() {
    this.priority = new PriorityCalculator();
    this.emergency = new EmergencyHandler();
    this.pedestrian = new PedestrianModel();
    this.prediction = new PredictionEngine();
    this.rl = new RLSimulator();

    this.currentState = null;
    this.lastResult = null;
    this.cycleCount = 0;
    this.totalVehiclesProcessed = 0;
    this.metrics = {
      avgWaitTime: 0,
      throughput: 0,
      efficiency: 85,
      emergencyResponseTime: 0,
    };
  }

  /**
   * Run a full decision cycle.
   * Returns the complete decision result.
   */
  runDecision(allData) {
    const prevState = this.currentState;

    // 1. Detect emergencies
    const emergencies = this.emergency.detectEmergencies(allData);

    // 2. Record state for prediction
    this.prediction.recordState(allData);

    // 3. Get predictions
    const predictionResult = this.prediction.predict();

    // 4. Get pedestrian status
    const pedStatus = this.pedestrian.getStatus(allData);

    // 5. Calculate priority scores
    const hour = new Date().getHours();
    const priorityResult = this.priority.evaluate(allData, hour);

    // 6. RL state and influence
    const stateHash = this.rl.getStateHash(allData);
    this.currentState = stateHash;

    // Apply RL modifiers to scores
    CONFIG.DIRECTIONS.forEach(dir => {
      const modifier = this.rl.getRLModifier(stateHash, dir);
      priorityResult.scores[dir] *= modifier;
    });

    // 7. Final decision: emergency override or highest score
    let selectedRoad;
    let decisionType;

    if (emergencies.length > 0) {
      selectedRoad = this.emergency.getGreenCorridorDirection();
      decisionType = 'emergency';
    } else {
      selectedRoad = CONFIG.DIRECTIONS.reduce((best, dir) =>
        priorityResult.scores[dir] > priorityResult.scores[best] ? dir : best,
        CONFIG.DIRECTIONS[0]
      );
      decisionType = 'algorithmic';
    }

    // 8. Calculate cycle time
    const cycleTime = this._calculateCycleTime(allData, selectedRoad, pedStatus);

    // 9. Generate decision explanation
    const reason = this._generateReason(allData, priorityResult, selectedRoad, decisionType, emergencies, pedStatus);

    // 10. Update starvation tracking
    this.priority.recordDecision(selectedRoad);

    // 11. RL learning step
    if (prevState) {
      const reward = this.rl.calculateReward(allData, selectedRoad);
      this.rl.learn(prevState, selectedRoad, reward, stateHash);
    }

    // 12. Update metrics
    this._updateMetrics(allData, selectedRoad);

    this.cycleCount++;

    this.lastResult = {
      selectedRoad,
      cycleTime,
      decisionType,
      reason,
      scores: priorityResult.scores,
      breakdowns: priorityResult.breakdowns,
      emergencies,
      emergencyAlerts: this.emergency.getAlerts(),
      corridor: this.emergency.getCorridorInfo(),
      pedStatus,
      predictions: predictionResult,
      rlStats: this.rl.getStats(),
      starvation: this.priority.getStarvationLevels(),
      metrics: { ...this.metrics },
      cycleCount: this.cycleCount,
    };

    return this.lastResult;
  }

  /**
   * Calculate adaptive cycle time.
   */
  _calculateCycleTime(allData, selectedRoad, pedStatus) {
    const d = allData[selectedRoad];
    const ct = CONFIG.CYCLE_TIME;

    let time = ct.BASE
      + d.vehicles * ct.VEHICLE_FACTOR
      + d.pedestrians * ct.PEDESTRIAN_FACTOR;

    // Extend for pedestrian phases
    if (pedStatus[selectedRoad]?.needsPhase) {
      time = Math.max(time, this.pedestrian.calculateCrossingTime(d.pedestrians));
    }

    // Emergency gets extended green
    if (d.emergency !== 'none') {
      time = Math.max(time, 40);
    }

    return Math.round(Math.min(ct.MAX, Math.max(ct.MIN, time)));
  }

  /**
   * Generate human-readable decision reason.
   */
  _generateReason(allData, priorityResult, selected, type, emergencies, pedStatus) {
    const d = allData[selected];
    const score = priorityResult.scores[selected].toFixed(1);

    if (type === 'emergency') {
      const e = emergencies[0];
      let reason = `🚨 EMERGENCY OVERRIDE — ${e.label} detected on ${selected.toUpperCase()} approach. Green corridor activated immediately.`;
      if (emergencies.length > 1) {
        reason += ` ${emergencies.length} emergency vehicles detected — highest priority (${e.label}) takes precedence.`;
      }
      return reason;
    }

    let reason = `${selected.toUpperCase()} selected (score: ${score}) — `;
    const parts = [];

    if (d.vehicles >= 15) parts.push(`high vehicle density (${d.vehicles})`);
    else if (d.vehicles >= 8) parts.push(`moderate traffic (${d.vehicles} vehicles)`);

    if (d.pedestrians >= 10) parts.push(`urgent pedestrian crossing (${d.pedestrians} waiting)`);
    else if (d.pedestrians >= 5) parts.push(`pedestrian group (${d.pedestrians})`);

    if (d.wait >= 40) parts.push(`long wait time (${d.wait}s)`);

    const starvation = this.priority.getStarvationLevels();
    if (starvation[selected] >= 3) parts.push(`starvation prevention triggered`);

    if (parts.length === 0) parts.push(`balanced evaluation of all factors`);

    reason += parts.join(', ') + '.';

    return reason;
  }

  /**
   * Update performance metrics.
   */
  _updateMetrics(allData, selectedRoad) {
    // Average wait time
    const totalWait = CONFIG.DIRECTIONS.reduce((s, d) => s + allData[d].wait, 0);
    this.metrics.avgWaitTime = Math.round(totalWait / 4);

    // Throughput (simulated)
    const totalVehicles = CONFIG.DIRECTIONS.reduce((s, d) => s + allData[d].vehicles, 0);
    this.totalVehiclesProcessed += allData[selectedRoad].vehicles;
    this.metrics.throughput = this.totalVehiclesProcessed;

    // Efficiency (based on how well we're clearing the busiest road)
    const maxVehicles = Math.max(...CONFIG.DIRECTIONS.map(d => allData[d].vehicles));
    const selectedVehicles = allData[selectedRoad].vehicles;
    const efficiencyDelta = selectedVehicles >= maxVehicles ? 1 : -0.5;
    this.metrics.efficiency = Math.round(
      Math.min(99, Math.max(60, this.metrics.efficiency + efficiencyDelta))
    );
  }

  /**
   * Get current metrics for display.
   */
  getMetrics() {
    return { ...this.metrics };
  }

  reset() {
    this.priority.reset();
    this.emergency.reset();
    this.pedestrian.reset();
    this.prediction.reset();
    this.rl.reset();
    this.currentState = null;
    this.lastResult = null;
    this.cycleCount = 0;
    this.totalVehiclesProcessed = 0;
    this.metrics = { avgWaitTime: 0, throughput: 0, efficiency: 85, emergencyResponseTime: 0 };
  }
}

export default TrafficEngine;
