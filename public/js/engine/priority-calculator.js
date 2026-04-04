// ============================================
// SAHTCS — Priority Calculator
// Multi-factor scoring with starvation prevention
// ============================================

import CONFIG from '../data/config.js';

export class PriorityCalculator {
  constructor() {
    this.cyclesWithoutGreen = { north: 0, south: 0, east: 0, west: 0 };
    this.lastGreenRoad = null;
    this.decisionHistory = [];
  }

  /**
   * Calculate priority score for a single direction.
   * Score = vehicleWeight + pedestrianWeight + waitWeight + emergencyBonus
   *       + starvationPenalty + fairnessBonus - recentGreenPenalty
   */
  calculateScore(directionData, direction, timeOfDay = 12) {
    const w = CONFIG.WEIGHTS;
    const d = directionData;

    // Base components
    const vehicleScore = d.vehicles * w.VEHICLE_DENSITY;

    // Pedestrian urgency increases with count (non-linear)
    const pedUrgency = Math.pow(d.pedestrians, 1.3);
    const pedestrianScore = pedUrgency * w.PEDESTRIAN_DENSITY;

    // Waiting time with exponential growth for long waits
    const waitFactor = d.wait <= 30 ? d.wait * w.WAITING_TIME
      : 30 * w.WAITING_TIME + (d.wait - 30) * w.WAITING_TIME * 2;

    // Emergency override
    const emergencyBonus = CONFIG.EMERGENCY[d.emergency]?.priority || 0;

    // Starvation prevention: roads waiting too long get a boost
    const starvationCycles = this.cyclesWithoutGreen[direction];
    const starvationPenalty = starvationCycles > CONFIG.STARVATION_THRESHOLD
      ? (starvationCycles - CONFIG.STARVATION_THRESHOLD) * w.STARVATION_PENALTY
      : 0;

    // Fairness: small bonus for each cycle skipped
    const fairnessBonus = starvationCycles * w.FAIRNESS_BONUS;

    // Recent green penalty: reduce score if this road just had green
    const recentGreenPenalty = this.lastGreenRoad === direction ? 8 : 0;

    // Time-of-day influence (rush hour = higher vehicle weight)
    const todFactor = this._getTimeOfDayFactor(timeOfDay);

    const totalScore = (
      vehicleScore * todFactor
      + pedestrianScore
      + waitFactor
      + emergencyBonus
      + starvationPenalty
      + fairnessBonus
      - recentGreenPenalty
    );

    return {
      total: Math.max(0, totalScore),
      breakdown: {
        vehicles: vehicleScore * todFactor,
        pedestrians: pedestrianScore,
        waitTime: waitFactor,
        emergency: emergencyBonus,
        starvation: starvationPenalty,
        fairness: fairnessBonus,
        recentPenalty: recentGreenPenalty,
      }
    };
  }

  /**
   * Calculate all scores and determine winner.
   */
  evaluate(allData, timeOfDay = 12) {
    const scores = {};
    const breakdowns = {};

    CONFIG.DIRECTIONS.forEach(dir => {
      const result = this.calculateScore(allData[dir], dir, timeOfDay);
      scores[dir] = result.total;
      breakdowns[dir] = result.breakdown;
    });

    // Find winner (highest score)
    const winner = CONFIG.DIRECTIONS.reduce((best, dir) =>
      scores[dir] > scores[best] ? dir : best,
      CONFIG.DIRECTIONS[0]
    );

    return { scores, breakdowns, winner };
  }

  /**
   * Update starvation counters after a decision.
   */
  recordDecision(selectedRoad) {
    CONFIG.DIRECTIONS.forEach(dir => {
      if (dir === selectedRoad) {
        this.cyclesWithoutGreen[dir] = 0;
      } else {
        this.cyclesWithoutGreen[dir]++;
      }
    });
    this.lastGreenRoad = selectedRoad;

    this.decisionHistory.push({
      road: selectedRoad,
      timestamp: Date.now(),
      starvation: { ...this.cyclesWithoutGreen },
    });

    // Keep history bounded
    if (this.decisionHistory.length > 100) {
      this.decisionHistory.shift();
    }
  }

  /**
   * Get starvation levels for UI.
   */
  getStarvationLevels() {
    return { ...this.cyclesWithoutGreen };
  }

  /**
   * Time of day factor: rush hours get higher vehicle weighting.
   */
  _getTimeOfDayFactor(hour) {
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return 1.3; // Rush hour
    } else if (hour >= 22 || hour <= 5) {
      return 0.6; // Night
    }
    return 1.0; // Normal
  }

  reset() {
    this.cyclesWithoutGreen = { north: 0, south: 0, east: 0, west: 0 };
    this.lastGreenRoad = null;
    this.decisionHistory = [];
  }
}

export default PriorityCalculator;
