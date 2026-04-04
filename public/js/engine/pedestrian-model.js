// ============================================
// SAHTCS — Pedestrian Model
// Realistic pedestrian timing behavior
// ============================================

import CONFIG from '../data/config.js';

export class PedestrianModel {
  constructor() {
    this.crosswalkPhases = { north: false, south: false, east: false, west: false };
    this.pedestrianQueues = { north: 0, south: 0, east: 0, west: 0 };
  }

  /**
   * Calculate crossing time needed for a pedestrian group.
   * Based on road width, group size, and walking speed.
   */
  calculateCrossingTime(pedestrianCount) {
    // Average walking speed: ~1.2m/s, road width: ~12m
    const baseCrossingTime = 10; // seconds
    // Groups slow each other down
    const groupDelay = Math.min(pedestrianCount * 0.5, 8);
    // Elderly/disabled buffer
    const safetyBuffer = 3;

    return baseCrossingTime + groupDelay + safetyBuffer;
  }

  /**
   * Determine if pedestrian phase should be activated.
   */
  shouldActivatePedestrianPhase(direction, data) {
    const pedCount = data[direction].pedestrians;

    // High pedestrian count triggers dedicated phase
    if (pedCount >= 10) return { activate: true, urgency: 'high', reason: 'High pedestrian volume' };
    if (pedCount >= 5)  return { activate: true, urgency: 'medium', reason: 'Moderate pedestrian group' };
    if (pedCount > 0)   return { activate: false, urgency: 'low', reason: 'Can cross with vehicle phase' };
    return { activate: false, urgency: 'none', reason: 'No pedestrians' };
  }

  /**
   * Get pedestrian urgency factor for priority scoring.
   * Higher urgency = higher factor.
   */
  getUrgencyFactor(pedestrianCount, waitTime) {
    if (pedestrianCount === 0) return 0;

    // Urgency increases with both count and wait time
    const countFactor = Math.min(pedestrianCount / 10, 2.0);
    const waitFactor = Math.min(waitTime / 60, 1.5);

    return 1.0 + countFactor + (waitFactor * 0.5);
  }

  /**
   * Get pedestrian status for each direction.
   */
  getStatus(allData) {
    const status = {};

    CONFIG.DIRECTIONS.forEach(dir => {
      const count = allData[dir].pedestrians;
      const phase = this.shouldActivatePedestrianPhase(dir, allData);

      status[dir] = {
        count,
        urgency: phase.urgency,
        crossingTime: this.calculateCrossingTime(count),
        needsPhase: phase.activate,
        reason: phase.reason,
      };
    });

    return status;
  }

  /**
   * Get total pedestrian load (for analytics).
   */
  getTotalLoad(allData) {
    return CONFIG.DIRECTIONS.reduce((sum, dir) => sum + allData[dir].pedestrians, 0);
  }

  reset() {
    this.crosswalkPhases = { north: false, south: false, east: false, west: false };
    this.pedestrianQueues = { north: 0, south: 0, east: 0, west: 0 };
  }
}

export default PedestrianModel;
