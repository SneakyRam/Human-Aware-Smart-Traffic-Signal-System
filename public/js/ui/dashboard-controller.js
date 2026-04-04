// ============================================
// SAHTCS — Dashboard Controller
// Orchestrates the entire dashboard
// ============================================

import CONFIG from '../data/config.js';
import { SCENARIOS } from '../data/scenarios.js';
import { TrafficEngine } from '../engine/traffic-engine.js';
import { IntersectionRenderer } from './intersection-renderer.js';
import { ChartManager } from './chart-manager.js';
import { HeatmapRenderer } from './heatmap-renderer.js';
import { NotificationManager } from './notification-manager.js';
import { ScenarioManager } from './scenario-manager.js';
import { el, cap } from '../utils/dom-helpers.js';
import { formatNumber, getDirectionColor, timestamp } from '../utils/formatters.js';

export class DashboardController {
  constructor() {
    this.engine = new TrafficEngine();
    this.intersection = new IntersectionRenderer();
    this.charts = new ChartManager();
    this.heatmap = new HeatmapRenderer();
    this.notifications = new NotificationManager();
    this.scenarios = new ScenarioManager((data, scenario) => {
      this.scenarios.writeToControls(data);
      this.runDecision();
      if (scenario.narration) {
        this._updateNarration(scenario.narration);
      }
      this.notifications.addLog('decision', `Scenario loaded: ${scenario.name}`);
    });

    this.autoInterval = null;
    this.simulationSpeed = 1;
    this.isRunning = false;
    this.lastEmergencyAlertTime = 0;
  }

  /**
   * Initialize everything.
   */
  async init() {
    this.intersection.init();
    this.notifications.init();
    this.heatmap.init('heatmap-canvas');

    await this.charts.init();

    this._bindEvents();
    this._bindSliders();
    this._bindScenarios();
    this._bindSpeedControls();

    // Run initial decision
    this.runDecision();

    this.notifications.addLog('ai', 'System initialized — AI engine ready');
    this.notifications.showToast({
      title: 'System Online',
      message: 'AI traffic engine initialized and ready',
      icon: '🟢',
      type: 'success',
    });
  }

  /**
   * Run a single decision cycle.
   */
  runDecision() {
    const data = this.scenarios.readFromControls();
    const result = this.engine.runDecision(data);

    // Update visuals
    this.intersection.renderAll(data, result.selectedRoad);
    this.intersection.updateEmergencyOverlay(result.corridor);

    // Update charts
    this.charts.update(data, result);

    // Update heatmap
    this.heatmap.update(data);

    // Update UI panels
    this._updateDecisionPanel(result);
    this._updateScoreBreakdown(result);
    this._updatePredictionPanel(result);
    this._updateMetricCards(result);
    this._updateRLPanel(result);
    this._updateHUDCards(data, result);
    this._updateEfficiencyDisplay(result);

    // Emergency alerts (debounced)
    if (result.emergencyAlerts.length > 0 && Date.now() - this.lastEmergencyAlertTime > 5000) {
      this.notifications.showEmergencyAlert(result.emergencyAlerts);
      this.lastEmergencyAlertTime = Date.now();
    }

    // Log entry based on type
    if (result.decisionType === 'emergency') {
      this.notifications.addLog('emergency', `🚨 Emergency override → ${cap(result.selectedRoad)} (${result.emergencies[0].label})`);
    } else {
      this.notifications.addLog('decision', `→ ${cap(result.selectedRoad)} selected (score: ${result.scores[result.selectedRoad].toFixed(1)}, cycle: ${result.cycleTime}s)`);
    }

    this.isRunning = true;
  }

  /**
   * Start auto cycle.
   */
  startAuto() {
    if (this.autoInterval) return;

    const speed = Math.max(300, CONFIG.AUTO_CYCLE_INTERVAL / this.simulationSpeed);

    this.autoInterval = setInterval(() => {
      const data = this.scenarios.generateRandom();
      this.scenarios.writeToControls(data);
      this.runDecision();
    }, speed);

    this.notifications.addLog('ai', `Auto-cycle started (${this.simulationSpeed}x speed)`);
    this._updateAutoButtonState(true);
  }

  /**
   * Stop auto cycle.
   */
  stopAuto() {
    clearInterval(this.autoInterval);
    this.autoInterval = null;
    this.notifications.addLog('ai', 'Auto-cycle stopped');
    this._updateAutoButtonState(false);
  }

  /**
   * Set simulation speed.
   */
  setSpeed(speed) {
    this.simulationSpeed = speed;
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.speed) === speed);
    });

    // Restart auto if running
    if (this.autoInterval) {
      this.stopAuto();
      this.startAuto();
    }
  }

  // ─── Private UI Update Methods ───

  _updateDecisionPanel(result) {
    const roadEl = el('selected-road');
    const cycleEl = el('cycle-time');
    const reasonEl = el('decision-reason');

    if (roadEl) {
      roadEl.textContent = cap(result.selectedRoad);
      roadEl.style.color = getDirectionColor(result.selectedRoad);
    }
    if (cycleEl) cycleEl.textContent = result.cycleTime;
    if (reasonEl) reasonEl.textContent = result.reason;
  }

  _updateScoreBreakdown(result) {
    const container = el('score-breakdown');
    if (!container) return;
    container.innerHTML = '';

    const maxScore = Math.max(...Object.values(result.scores), 1);

    CONFIG.DIRECTIONS.forEach(dir => {
      const score = result.scores[dir];
      const pct = (score / maxScore) * 100;
      const isWinner = dir === result.selectedRoad;

      const row = document.createElement('div');
      row.className = `score-row ${isWinner ? 'winner' : ''}`;
      row.innerHTML = `
        <span class="score-label">${cap(dir)}</span>
        <div class="score-bar-track">
          <div class="score-bar-fill" style="width: ${pct}%; background: ${isWinner ? '' : `${getDirectionColor(dir)}40`}"></div>
        </div>
        <span class="score-value">${score.toFixed(1)}</span>
      `;
      container.appendChild(row);
    });
  }

  _updatePredictionPanel(result) {
    if (!result.predictions) return;

    const pred = result.predictions.predictions;
    const trends = result.predictions.trends;

    CONFIG.DIRECTIONS.forEach(dir => {
      const valEl = el(`pred-${dir}-val`);
      const trendEl = el(`pred-${dir}-trend`);

      if (valEl) valEl.textContent = pred[dir] || 0;
      if (trendEl) {
        const trend = trends[dir];
        trendEl.textContent = trend === 'up' ? '↑ Rising' : trend === 'down' ? '↓ Falling' : '→ Stable';
        trendEl.className = `pred-trend ${trend}`;
      }
    });

    const confEl = el('pred-confidence');
    if (confEl) confEl.textContent = `${Math.round((result.predictions.confidence || 0.7) * 100)}%`;
  }

  _updateMetricCards(result) {
    const m = result.metrics;

    const avgWait = el('metric-avg-wait');
    const throughput = el('metric-throughput');
    const efficiency = el('metric-efficiency');
    const cycles = el('metric-cycles');

    if (avgWait) avgWait.textContent = m.avgWaitTime + 's';
    if (throughput) throughput.textContent = m.throughput;
    if (efficiency) efficiency.textContent = m.efficiency + '%';
    if (cycles) cycles.textContent = result.cycleCount;
  }

  _updateRLPanel(result) {
    const stats = result.rlStats;
    if (!stats) return;

    const episodes = el('rl-episodes');
    const explored = el('rl-states');
    const reward = el('rl-reward');
    const progress = el('rl-progress');
    const progressBar = el('rl-progress-bar');

    if (episodes) episodes.textContent = stats.episodes;
    if (explored) explored.textContent = stats.statesExplored;
    if (reward) reward.textContent = stats.averageReward;
    if (progress) progress.textContent = stats.learningProgress + '%';
    if (progressBar) progressBar.style.width = stats.learningProgress + '%';
  }

  _updateHUDCards(data, result) {
    CONFIG.DIRECTIONS.forEach(dir => {
      const vEl = el(`hud-${dir}-vehicles`);
      const pEl = el(`hud-${dir}-peds`);
      const eEl = el(`hud-${dir}-emergency`);

      if (vEl) vEl.textContent = data[dir].vehicles;
      if (pEl) pEl.textContent = data[dir].pedestrians;
      if (eEl) {
        const isEmergency = data[dir].emergency !== 'none';
        eEl.textContent = isEmergency ? '🚨' : '—';
        eEl.style.opacity = isEmergency ? '1' : '0.3';
      }
    });
  }

  _updateEfficiencyDisplay(result) {
    const gauge = el('efficiency-value');
    if (gauge) gauge.textContent = result.metrics.efficiency + '%';
  }

  _updateNarration(text) {
    const narration = el('narration-text');
    if (narration) {
      narration.textContent = text;
      narration.style.animation = 'none';
      narration.offsetHeight; // trigger reflow
      narration.style.animation = 'fadeInUp 0.4s var(--ease-out)';
    }
  }

  _updateAutoButtonState(isRunning) {
    const autoBtn = el('btn-auto');
    const stopBtn = el('btn-stop');

    if (autoBtn) {
      autoBtn.classList.toggle('active', isRunning);
      autoBtn.disabled = isRunning;
    }
    if (stopBtn) {
      stopBtn.disabled = !isRunning;
    }
  }

  // ─── Event Bindings ───

  _bindEvents() {
    el('btn-run')?.addEventListener('click', () => this.runDecision());
    el('btn-auto')?.addEventListener('click', () => this.startAuto());
    el('btn-stop')?.addEventListener('click', () => this.stopAuto());
    el('btn-reset')?.addEventListener('click', () => {
      this.engine.reset();
      this.charts.destroy();
      this.charts.init();
      this.notifications.clear();
      this.notifications.addLog('ai', 'System reset');
    });
  }

  _bindSliders() {
    CONFIG.DIRECTIONS.forEach(dir => {
      ['vehicles', 'pedestrians', 'wait'].forEach(field => {
        const slider = el(`${dir}-${field}`);
        const display = el(`${dir}-${field}-val`);
        if (slider && display) {
          slider.addEventListener('input', () => {
            display.textContent = field === 'wait' ? slider.value + 's' : slider.value;
          });
        }
      });
    });
  }

  _bindScenarios() {
    SCENARIOS.forEach(scenario => {
      const btn = el(`scenario-${scenario.id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.scenarios.applyScenario(scenario.id);
        });
      }
    });
  }

  _bindSpeedControls() {
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setSpeed(Number(btn.dataset.speed));
      });
    });
  }
}

export default DashboardController;
