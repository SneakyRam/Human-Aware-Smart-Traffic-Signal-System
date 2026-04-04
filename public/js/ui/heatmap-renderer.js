// ============================================
// SAHTCS — Heatmap Renderer
// Canvas-based traffic density heatmap
// ============================================

export class HeatmapRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.data = [];
    this.gridSize = 8;
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Set canvas resolution
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * 2;
    this.canvas.height = rect.height * 2;
    this.ctx.scale(2, 2);

    // Initialize grid
    this._initGrid(rect.width, rect.height);
  }

  _initGrid(width, height) {
    this.data = [];
    const cellW = width / this.gridSize;
    const cellH = height / this.gridSize;

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        this.data.push({
          x: col * cellW,
          y: row * cellH,
          w: cellW,
          h: cellH,
          value: 0,
        });
      }
    }
  }

  /**
   * Update heatmap with traffic data.
   */
  update(allData) {
    if (!this.ctx) return;

    const rect = this.canvas.getBoundingClientRect();

    // Map directions to grid regions
    // North = top rows, South = bottom rows, East = right cols, West = left cols
    const regions = {
      north: { rows: [0, 1, 2], cols: [2, 3, 4, 5] },
      south: { rows: [5, 6, 7], cols: [2, 3, 4, 5] },
      east:  { rows: [2, 3, 4, 5], cols: [5, 6, 7] },
      west:  { rows: [2, 3, 4, 5], cols: [0, 1, 2] },
    };

    // Reset all
    this.data.forEach(cell => {
      cell.value = Math.max(0, cell.value * 0.7);
    });

    // Apply data
    Object.entries(regions).forEach(([dir, region]) => {
      const density = allData[dir].vehicles / 20; // normalize to 0-1
      region.rows.forEach(row => {
        region.cols.forEach(col => {
          const idx = row * this.gridSize + col;
          if (this.data[idx]) {
            // Add some randomness for natural look
            this.data[idx].value = Math.min(1,
              density * (0.7 + Math.random() * 0.3)
            );
          }
        });
      });
    });

    // Center intersection is always moderate
    const centerCells = [27, 28, 35, 36];
    centerCells.forEach(idx => {
      if (this.data[idx]) this.data[idx].value = 0.3;
    });

    this._render(rect.width, rect.height);
  }

  _render(width, height) {
    this.ctx.clearRect(0, 0, width, height);

    this.data.forEach(cell => {
      const intensity = cell.value;

      // Color gradient: dark → blue → yellow → red
      let r, g, b;
      if (intensity < 0.3) {
        r = 14; g = Math.round(165 * intensity / 0.3); b = Math.round(233 * intensity / 0.3);
      } else if (intensity < 0.6) {
        const t = (intensity - 0.3) / 0.3;
        r = Math.round(14 + (245 - 14) * t);
        g = Math.round(165 + (158 - 165) * t);
        b = Math.round(233 + (11 - 233) * t);
      } else {
        const t = (intensity - 0.6) / 0.4;
        r = Math.round(245 + (239 - 245) * t);
        g = Math.round(158 - 158 * t);
        b = Math.round(11 + (68 - 11) * t);
      }

      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.65})`;
      this.ctx.beginPath();

      // Round rects for softer look
      const margin = 2;
      const rx = cell.x + margin;
      const ry = cell.y + margin;
      const rw = cell.w - margin * 2;
      const rh = cell.h - margin * 2;
      const radius = 4;

      this.ctx.moveTo(rx + radius, ry);
      this.ctx.lineTo(rx + rw - radius, ry);
      this.ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
      this.ctx.lineTo(rx + rw, ry + rh - radius);
      this.ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
      this.ctx.lineTo(rx + radius, ry + rh);
      this.ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
      this.ctx.lineTo(rx, ry + radius);
      this.ctx.quadraticCurveTo(rx, ry, rx + radius, ry);

      this.ctx.fill();
    });
  }
}

export default HeatmapRenderer;
