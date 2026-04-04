// ============================================
// SAHTCS — Scenario Manager
// Handles demo scenario loading & auto-cycle
// ============================================

import CONFIG from '../data/config.js';
import { SCENARIOS } from '../data/scenarios.js';
import { el } from '../utils/dom-helpers.js';
import { randomInt, randomChoice } from '../utils/formatters.js';

export class ScenarioManager {
  constructor(onScenarioApply) {
    this.onScenarioApply = onScenarioApply;
    this.currentScenario = null;
    this.activeButton = null;
  }

  /**
   * Apply a scenario by ID.
   */
  applyScenario(scenarioId) {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return null;

    this.currentScenario = scenario;
    this._highlightButton(scenarioId);

    if (this.onScenarioApply) {
      this.onScenarioApply(scenario.data, scenario);
    }

    return scenario;
  }

  /**
   * Generate random traffic data.
   */
  generateRandom() {
    const emergencies = ['none', 'none', 'none', 'none', 'ambulance', 'firetruck', 'police'];
    const data = {};

    CONFIG.DIRECTIONS.forEach(dir => {
      data[dir] = {
        vehicles: randomInt(1, 20),
        pedestrians: randomInt(0, 15),
        emergency: randomChoice(emergencies),
        wait: randomInt(5, 70),
      };
    });

    return data;
  }

  /**
   * Read current data from controls.
   */
  readFromControls() {
    const data = {};

    CONFIG.DIRECTIONS.forEach(dir => {
      data[dir] = {
        vehicles: Number(el(`${dir}-vehicles`)?.value || 0),
        pedestrians: Number(el(`${dir}-pedestrians`)?.value || 0),
        emergency: el(`${dir}-emergency`)?.value || 'none',
        wait: Number(el(`${dir}-wait`)?.value || 0),
      };
    });

    return data;
  }

  /**
   * Write data to controls.
   */
  writeToControls(data) {
    CONFIG.DIRECTIONS.forEach(dir => {
      const d = data[dir];
      const vEl = el(`${dir}-vehicles`);
      const pEl = el(`${dir}-pedestrians`);
      const eEl = el(`${dir}-emergency`);
      const wEl = el(`${dir}-wait`);

      if (vEl) vEl.value = d.vehicles;
      if (pEl) pEl.value = d.pedestrians;
      if (eEl) eEl.value = d.emergency;
      if (wEl) wEl.value = d.wait;

      // Update value displays
      const vDisp = el(`${dir}-vehicles-val`);
      const pDisp = el(`${dir}-pedestrians-val`);
      const wDisp = el(`${dir}-wait-val`);
      if (vDisp) vDisp.textContent = d.vehicles;
      if (pDisp) pDisp.textContent = d.pedestrians;
      if (wDisp) wDisp.textContent = d.wait + 's';
    });
  }

  /**
   * Highlight active scenario button.
   */
  _highlightButton(scenarioId) {
    // Clear previous
    document.querySelectorAll('.btn-scenario').forEach(btn => {
      btn.classList.remove('active');
    });

    // Set new
    const btn = el(`scenario-${scenarioId}`);
    if (btn) btn.classList.add('active');
    this.activeButton = btn;
  }

  /**
   * Get current scenario narration.
   */
  getNarration() {
    return this.currentScenario?.narration || '';
  }
}

export default ScenarioManager;
