// ============================================
// SAHTCS — Reinforcement Learning Simulator
// Q-Learning based signal optimization
// ============================================

import CONFIG from '../data/config.js';

export class RLSimulator {
  constructor() {
    // Q-table: state → action → value
    // State = simplified traffic pattern hash
    // Action = which direction to green
    this.qTable = {};
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.epsilon = 0.15; // exploration rate
    this.episodeCount = 0;
    this.totalReward = 0;
    this.rewardHistory = [];
    this.learningProgress = 0;
  }

  /**
   * Create simplified state hash from traffic data.
   */
  getStateHash(allData) {
    // Quantize data into buckets for manageable state space
    const quantize = (val, buckets) => Math.min(Math.floor(val / (20 / buckets)), buckets - 1);

    const parts = CONFIG.DIRECTIONS.map(dir => {
      const d = allData[dir];
      const v = quantize(d.vehicles, 4);
      const p = quantize(d.pedestrians, 3);
      const e = d.emergency !== 'none' ? 1 : 0;
      const w = quantize(d.wait, 3);
      return `${v}${p}${e}${w}`;
    });

    return parts.join('-');
  }

  /**
   * Get Q-value for a state-action pair.
   */
  getQValue(state, action) {
    if (!this.qTable[state]) return 0;
    return this.qTable[state][action] || 0;
  }

  /**
   * Get best action for a state.
   */
  getBestAction(state) {
    if (!this.qTable[state]) return null;

    let bestAction = null;
    let bestValue = -Infinity;

    CONFIG.DIRECTIONS.forEach(dir => {
      const val = this.getQValue(state, dir);
      if (val > bestValue) {
        bestValue = val;
        bestAction = dir;
      }
    });

    return bestAction;
  }

  /**
   * Select action using epsilon-greedy policy.
   */
  selectAction(state) {
    // Exploration
    if (Math.random() < this.epsilon) {
      return CONFIG.DIRECTIONS[Math.floor(Math.random() * 4)];
    }

    // Exploitation
    const best = this.getBestAction(state);
    return best || CONFIG.DIRECTIONS[Math.floor(Math.random() * 4)];
  }

  /**
   * Calculate reward based on traffic outcome.
   */
  calculateReward(allData, selectedRoad) {
    const d = allData[selectedRoad];
    let reward = 0;

    // Reward for clearing high-density road
    reward += d.vehicles * 2;
    reward += d.pedestrians * 1.5;

    // Reward for handling emergency
    if (d.emergency !== 'none') reward += 50;

    // Penalty for long wait on other roads
    CONFIG.DIRECTIONS.forEach(dir => {
      if (dir !== selectedRoad) {
        reward -= allData[dir].wait * 0.1;
      }
    });

    // Penalty for ignoring high-density roads
    CONFIG.DIRECTIONS.forEach(dir => {
      if (dir !== selectedRoad && allData[dir].vehicles > 15) {
        reward -= 10;
      }
    });

    return reward;
  }

  /**
   * Update Q-value after a decision.
   */
  learn(state, action, reward, nextState) {
    if (!this.qTable[state]) this.qTable[state] = {};

    const currentQ = this.getQValue(state, action);
    const bestNextQ = Math.max(
      ...CONFIG.DIRECTIONS.map(d => this.getQValue(nextState, d)),
      0
    );

    // Q-Learning update rule
    const newQ = currentQ + this.learningRate * (
      reward + this.discountFactor * bestNextQ - currentQ
    );

    this.qTable[state][action] = newQ;

    this.episodeCount++;
    this.totalReward += reward;
    this.rewardHistory.push(reward);
    if (this.rewardHistory.length > 50) this.rewardHistory.shift();

    // Decay exploration rate over time
    this.epsilon = Math.max(0.05, this.epsilon * 0.999);

    // Update learning progress
    this.learningProgress = Math.min(100, this.episodeCount / 2);
  }

  /**
   * Get RL modifier for priority scoring.
   */
  getRLModifier(state, direction) {
    const qValue = this.getQValue(state, direction);
    if (qValue === 0) return 1.0;
    // Normalize Q-value to a small multiplier
    return 1.0 + Math.tanh(qValue / 50) * 0.2;
  }

  /**
   * Get learning stats for UI.
   */
  getStats() {
    const avgReward = this.rewardHistory.length > 0
      ? this.rewardHistory.reduce((s, r) => s + r, 0) / this.rewardHistory.length
      : 0;

    return {
      episodes: this.episodeCount,
      totalReward: Math.round(this.totalReward),
      averageReward: Math.round(avgReward * 10) / 10,
      explorationRate: Math.round(this.epsilon * 100),
      statesExplored: Object.keys(this.qTable).length,
      learningProgress: Math.round(this.learningProgress),
    };
  }

  reset() {
    this.qTable = {};
    this.episodeCount = 0;
    this.totalReward = 0;
    this.rewardHistory = [];
    this.epsilon = 0.15;
    this.learningProgress = 0;
  }
}

export default RLSimulator;
