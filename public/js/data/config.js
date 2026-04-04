// ============================================
// SAHTCS — App Configuration
// ============================================

export const CONFIG = {
  // Simulation
  SIMULATION_SPEED: 1, // 1x, 2x, 5x, 10x
  AUTO_CYCLE_INTERVAL: 2500, // ms
  SIGNAL_TRANSITION_DELAY: 300, // ms for yellow phase

  // Algorithm weights (tunable)
  WEIGHTS: {
    VEHICLE_DENSITY: 5,
    PEDESTRIAN_DENSITY: 4,
    WAITING_TIME: 0.25,
    STARVATION_PENALTY: 8,      // per cycle without green
    FAIRNESS_BONUS: 3,          // increasing each skipped cycle
    TIME_OF_DAY_FACTOR: 1.0,    // adjusted by TOD
    PREDICTION_WEIGHT: 2,       // future traffic influence
    RL_MODIFIER: 1.0,           // reinforcement learning adjustment
  },

  // Emergency priorities
  EMERGENCY: {
    ambulance: { priority: 200, label: 'Ambulance', color: '#ef4444' },
    firetruck: { priority: 170, label: 'Fire Truck', color: '#f97316' },
    police:    { priority: 120, label: 'Police', color: '#3b82f6' },
    none:      { priority: 0,   label: 'None', color: 'transparent' },
  },

  // Cycle time bounds
  CYCLE_TIME: {
    MIN: 15,
    MAX: 90,
    BASE: 12,
    VEHICLE_FACTOR: 2.5,
    PEDESTRIAN_FACTOR: 1.5,
  },

  // Starvation threshold (cycles without green before penalty kicks in)
  STARVATION_THRESHOLD: 2,
  MAX_STARVATION_CYCLES: 6,

  // Directions
  DIRECTIONS: ['north', 'south', 'east', 'west'],

  // Chart
  CHART_HISTORY_LENGTH: 20,

  // Heatmap
  HEATMAP_GRID: 8,
};

export default CONFIG;
