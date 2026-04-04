// ============================================
// SAHTCS — Emergency Handler
// Instant green corridor logic
// ============================================

import CONFIG from '../data/config.js';

export class EmergencyHandler {
  constructor() {
    this.activeEmergencies = {};
    this.emergencyLog = [];
  }

  /**
   * Detect all active emergencies in the data.
   */
  detectEmergencies(allData) {
    const emergencies = [];

    CONFIG.DIRECTIONS.forEach(dir => {
      const d = allData[dir];
      if (d.emergency !== 'none') {
        emergencies.push({
          direction: dir,
          type: d.emergency,
          priority: CONFIG.EMERGENCY[d.emergency].priority,
          label: CONFIG.EMERGENCY[d.emergency].label,
          color: CONFIG.EMERGENCY[d.emergency].color,
        });
      }
    });

    // Sort by priority (highest first)
    emergencies.sort((a, b) => b.priority - a.priority);

    this.activeEmergencies = emergencies;
    return emergencies;
  }

  /**
   * Check if any emergency is active.
   */
  hasEmergency() {
    return this.activeEmergencies.length > 0;
  }

  /**
   * Get the highest priority emergency (for green corridor).
   */
  getTopEmergency() {
    return this.activeEmergencies[0] || null;
  }

  /**
   * Check for emergency conflict (multiple emergencies at once).
   */
  hasConflict() {
    return this.activeEmergencies.length > 1;
  }

  /**
   * Get the direction that should receive green for emergency.
   * In case of conflict, highest priority wins.
   */
  getGreenCorridorDirection() {
    const top = this.getTopEmergency();
    return top ? top.direction : null;
  }

  /**
   * Generate emergency alert data for the notification system.
   */
  getAlerts() {
    const alerts = [];

    if (this.hasEmergency()) {
      const top = this.getTopEmergency();
      alerts.push({
        type: 'emergency',
        severity: 'critical',
        title: `${top.label} Detected!`,
        message: `Emergency vehicle approaching from ${top.direction.toUpperCase()}. Green corridor activated.`,
        direction: top.direction,
        vehicleType: top.type,
      });
    }

    if (this.hasConflict()) {
      alerts.push({
        type: 'conflict',
        severity: 'warning',
        title: 'Emergency Conflict',
        message: `Multiple emergency vehicles detected. Prioritizing ${this.getTopEmergency().label}.`,
      });
    }

    return alerts;
  }

  /**
   * Get corridor visualization data.
   */
  getCorridorInfo() {
    const dir = this.getGreenCorridorDirection();
    if (!dir) return null;

    return {
      direction: dir,
      orientation: (dir === 'north' || dir === 'south') ? 'ns' : 'ew',
      type: this.getTopEmergency().type,
    };
  }

  /**
   * Log emergency event.
   */
  logEmergency(event) {
    this.emergencyLog.push({
      ...event,
      timestamp: Date.now(),
    });
    if (this.emergencyLog.length > 50) this.emergencyLog.shift();
  }

  reset() {
    this.activeEmergencies = {};
    this.emergencyLog = [];
  }
}

export default EmergencyHandler;
