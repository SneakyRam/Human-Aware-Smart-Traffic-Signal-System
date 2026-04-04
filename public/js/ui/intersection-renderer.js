// ============================================
// SAHTCS — Intersection Renderer
// Presentation-Grade Vehicle & Signal Rendering
// ============================================

import CONFIG from '../data/config.js';
import { el, create } from '../utils/dom-helpers.js';

const CAR_COLORS = ['car', 'car-red', 'car-white', 'car-yellow', 'car-green'];

export class IntersectionRenderer {
  constructor() {
    this.emergencyOverlay = null;
    this.corridors = {};
    this.currentGreenRoad = null;
    this.moveInterval = null;
  }

  init() {
    this.emergencyOverlay = el('emergency-overlay');
    this.corridors = {
      ns: el('corridor-ns'),
      ew: el('corridor-ew'),
    };
  }

  clearSignals() {
    CONFIG.DIRECTIONS.forEach(dir => {
      const lamps = document.querySelectorAll(`#signal-${dir} .lamp`);
      lamps.forEach(lamp => lamp.classList.remove('active', 'red', 'yellow', 'green'));
    });
  }

  setSignal(road, color) {
    const map = { red: 0, yellow: 1, green: 2 };
    const lamps = document.querySelectorAll(`#signal-${road} .lamp`);
    if (lamps[map[color]]) lamps[map[color]].classList.add('active', color);
  }

  updateSignals(selectedRoad) {
    this.clearSignals();
    this.currentGreenRoad = selectedRoad;
    CONFIG.DIRECTIONS.forEach(road => {
      this.setSignal(road, road === selectedRoad ? 'green' : 'red');
    });
  }

  updateHUDSignals(selectedRoad) {
    CONFIG.DIRECTIONS.forEach(dir => {
      const dot = el(`hud-signal-${dir}`);
      if (!dot) return;
      dot.className = 'hud-signal-dot';
      dot.classList.add(dir === selectedRoad ? 'green' : 'red');
    });
  }

  /**
   * Create a realistic vehicle element with headlights + taillights.
   */
  _createVehicle(type, orientation, facingDir) {
    const vehicle = create('div', {
      className: `vehicle ${type} ${orientation} ${facingDir}-facing`
    });

    // Add headlights
    vehicle.appendChild(create('div', { className: 'headlight-l' }));
    vehicle.appendChild(create('div', { className: 'headlight-r' }));

    // Add taillights
    vehicle.appendChild(create('div', { className: 'taillight-l' }));
    vehicle.appendChild(create('div', { className: 'taillight-r' }));

    // Emergency siren light
    if (type === 'ambulance' || type === 'firetruck' || type === 'police') {
      vehicle.appendChild(create('div', { className: 'siren' }));
    }

    return vehicle;
  }

  /**
   * Get varied vehicle types for visual interest.
   */
  _getVehicleTypes(count, emergency) {
    const types = [];
    if (emergency !== 'none') {
      types.push(emergency);
    }
    for (let i = types.length; i < count; i++) {
      if (i % 8 === 0) types.push('bus');
      else if (i % 6 === 0) types.push('truck');
      else types.push(CAR_COLORS[i % CAR_COLORS.length]);
    }
    return types.slice(0, count);
  }

  /**
   * Render queued vehicles on a road.
   */
  renderVehicles(road, count, emergency) {
    const lane = el(`lane-${road}`);
    if (!lane) return;
    lane.innerHTML = '';

    const displayCount = Math.min(count, 7);
    const isVert = (road === 'north' || road === 'south');
    const orientation = isVert ? 'vertical' : 'horizontal';
    const types = this._getVehicleTypes(displayCount, emergency);

    types.forEach((type, i) => {
      const vehicle = this._createVehicle(type, orientation, road);

      // Calculate spacing based on vehicle size
      const baseSize = (type === 'bus' || type === 'firetruck') ? 58 : 46;
      const spacing = baseSize;

      if (road === 'north') {
        vehicle.style.top = `${i * spacing}px`;
      } else if (road === 'south') {
        vehicle.style.bottom = `${i * spacing}px`;
      } else if (road === 'east') {
        vehicle.style.right = `${i * spacing}px`;
      } else {
        vehicle.style.left = `${i * spacing}px`;
      }

      // Staggered entrance animation
      vehicle.style.animation = `fadeInUp 0.35s var(--ease-out) ${i * 0.06}s both`;

      lane.appendChild(vehicle);
    });
  }

  /**
   * Render pedestrians with walking animation.
   */
  renderPedestrians(road, count) {
    const zone = el(`ped-${road}`);
    if (!zone) return;
    zone.innerHTML = '';

    const displayCount = Math.min(count, 7);
    const isVert = (road === 'north' || road === 'south');

    for (let i = 0; i < displayCount; i++) {
      const ped = create('div', {
        className: `pedestrian ${Math.random() > 0.5 ? 'walking' : ''}`
      });

      if (isVert) {
        ped.style.left = `${4 + i * 11}px`;
        ped.style.top = `${(i % 2) * 6}px`;
      } else {
        ped.style.top = `${4 + i * 11}px`;
        ped.style.left = `${(i % 2) * 6}px`;
      }

      ped.style.animationDelay = `${i * 0.15}s`;
      zone.appendChild(ped);
    }
  }

  /**
   * Animate vehicles through the intersection on green.
   */
  animateTrafficFlow(road) {
    if (this.moveInterval) clearTimeout(this.moveInterval);

    const lane = el(`lane-${road}`);
    if (!lane) return;

    const vehicles = lane.querySelectorAll('.vehicle');
    if (vehicles.length === 0) return;

    // Move vehicles one by one with delay
    vehicles.forEach((vehicle, i) => {
      setTimeout(() => {
        vehicle.classList.add('moving-through', `move-${road}`);
      }, i * 300);
    });

    // After all vehicles move, remove them
    this.moveInterval = setTimeout(() => {
      const movedVehicles = lane.querySelectorAll('.moving-through');
      movedVehicles.forEach(v => v.remove());
    }, vehicles.length * 300 + 1600);
  }

  /**
   * Full render pass.
   */
  renderAll(allData, selectedRoad) {
    CONFIG.DIRECTIONS.forEach(dir => {
      this.renderVehicles(dir, allData[dir].vehicles, allData[dir].emergency);
      this.renderPedestrians(dir, allData[dir].pedestrians);
    });
    this.updateSignals(selectedRoad);
    this.updateHUDSignals(selectedRoad);

    // Animate vehicles on the green road moving through
    setTimeout(() => {
      this.animateTrafficFlow(selectedRoad);
    }, 600);
  }

  /**
   * Emergency overlay & green corridor.
   */
  updateEmergencyOverlay(corridorInfo) {
    if (this.emergencyOverlay) {
      this.emergencyOverlay.classList.toggle('active', !!corridorInfo);
    }

    if (this.corridors.ns) {
      this.corridors.ns.classList.toggle('active',
        corridorInfo && corridorInfo.orientation === 'ns');
    }
    if (this.corridors.ew) {
      this.corridors.ew.classList.toggle('active',
        corridorInfo && corridorInfo.orientation === 'ew');
    }
  }
}

export default IntersectionRenderer;
