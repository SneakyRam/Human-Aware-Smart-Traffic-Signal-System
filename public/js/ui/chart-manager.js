// ============================================
// SAHTCS — Chart Manager
// Real-time traffic analytics charts
// ============================================

import CONFIG from '../data/config.js';
import { getDirectionColor } from '../utils/formatters.js';

export class ChartManager {
  constructor() {
    this.charts = {};
    this.densityHistory = { north: [], south: [], east: [], west: [] };
    this.waitHistory = { north: [], south: [], east: [], west: [] };
    this.labels = [];
    this.chartReady = false;
  }

  /**
   * Initialize all charts.
   */
  async init() {
    // Wait for Chart.js
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded yet');
      return;
    }

    // Global Chart.js defaults
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(99, 140, 200, 0.08)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;

    this._createDensityChart();
    this._createWaitTimeChart();
    this._createDistributionChart();
    this._createEfficiencyChart();

    this.chartReady = true;
  }

  /**
   * Update charts with new data.
   */
  update(allData, result) {
    if (!this.chartReady) return;

    // Add time label
    const now = new Date();
    const label = `${now.getMinutes()}:${now.getSeconds().toString().padStart(2, '0')}`;
    this.labels.push(label);
    if (this.labels.length > CONFIG.CHART_HISTORY_LENGTH) this.labels.shift();

    // Record history
    CONFIG.DIRECTIONS.forEach(dir => {
      this.densityHistory[dir].push(allData[dir].vehicles);
      this.waitHistory[dir].push(allData[dir].wait);
      if (this.densityHistory[dir].length > CONFIG.CHART_HISTORY_LENGTH) {
        this.densityHistory[dir].shift();
      }
      if (this.waitHistory[dir].length > CONFIG.CHART_HISTORY_LENGTH) {
        this.waitHistory[dir].shift();
      }
    });

    // Update density chart
    this._updateDensityChart();

    // Update wait time chart
    this._updateWaitTimeChart(allData);

    // Update distribution chart
    this._updateDistributionChart(allData);

    // Update efficiency gauge
    this._updateEfficiencyChart(result?.metrics?.efficiency || 85);
  }

  _createDensityChart() {
    const canvas = document.getElementById('density-chart');
    if (!canvas) return;

    this.charts.density = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: CONFIG.DIRECTIONS.map(dir => ({
          label: dir.charAt(0).toUpperCase() + dir.slice(1),
          data: [],
          borderColor: getDirectionColor(dir),
          backgroundColor: getDirectionColor(dir) + '15',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { display: true, grid: { display: false } },
          y: {
            display: true,
            beginAtZero: true,
            max: 25,
            grid: { color: 'rgba(99, 140, 200, 0.06)' },
          },
        },
        plugins: {
          legend: { display: true, position: 'top' },
        },
        animation: { duration: 300 },
      },
    });
  }

  _createWaitTimeChart() {
    const canvas = document.getElementById('wait-chart');
    if (!canvas) return;

    this.charts.waitTime = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['North', 'South', 'East', 'West'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: CONFIG.DIRECTIONS.map(d => getDirectionColor(d) + '60'),
          borderColor: CONFIG.DIRECTIONS.map(d => getDirectionColor(d)),
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(99, 140, 200, 0.06)' },
            ticks: { callback: v => v + 's' },
          },
        },
        animation: { duration: 400 },
      },
    });
  }

  _createDistributionChart() {
    const canvas = document.getElementById('distribution-chart');
    if (!canvas) return;

    this.charts.distribution = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['North', 'South', 'East', 'West'],
        datasets: [{
          data: [25, 25, 25, 25],
          backgroundColor: CONFIG.DIRECTIONS.map(d => getDirectionColor(d) + '80'),
          borderColor: CONFIG.DIRECTIONS.map(d => getDirectionColor(d)),
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: true, position: 'bottom' },
        },
        animation: { duration: 400 },
      },
    });
  }

  _createEfficiencyChart() {
    const canvas = document.getElementById('efficiency-chart');
    if (!canvas) return;

    this.charts.efficiency = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Efficiency', ''],
        datasets: [{
          data: [85, 15],
          backgroundColor: ['#10b981', 'rgba(255,255,255,0.04)'],
          borderWidth: 0,
          hoverOffset: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        animation: { duration: 600 },
      },
    });
  }

  _updateDensityChart() {
    if (!this.charts.density) return;
    this.charts.density.data.labels = [...this.labels];
    CONFIG.DIRECTIONS.forEach((dir, i) => {
      this.charts.density.data.datasets[i].data = [...this.densityHistory[dir]];
    });
    this.charts.density.update('none');
  }

  _updateWaitTimeChart(allData) {
    if (!this.charts.waitTime) return;
    this.charts.waitTime.data.datasets[0].data = CONFIG.DIRECTIONS.map(d => allData[d].wait);
    this.charts.waitTime.update('none');
  }

  _updateDistributionChart(allData) {
    if (!this.charts.distribution) return;
    const total = CONFIG.DIRECTIONS.reduce((s, d) => s + allData[d].vehicles, 0) || 1;
    this.charts.distribution.data.datasets[0].data = CONFIG.DIRECTIONS.map(
      d => Math.round((allData[d].vehicles / total) * 100)
    );
    this.charts.distribution.update('none');
  }

  _updateEfficiencyChart(efficiency) {
    if (!this.charts.efficiency) return;
    this.charts.efficiency.data.datasets[0].data = [efficiency, 100 - efficiency];

    // Color based on efficiency
    let color = '#10b981';
    if (efficiency < 70) color = '#f59e0b';
    if (efficiency < 50) color = '#ef4444';
    this.charts.efficiency.data.datasets[0].backgroundColor[0] = color;

    this.charts.efficiency.update('none');
  }

  destroy() {
    Object.values(this.charts).forEach(chart => chart?.destroy());
    this.charts = {};
    this.chartReady = false;
  }
}

export default ChartManager;
