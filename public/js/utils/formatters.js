// ============================================
// SAHTCS — Formatters & Utilities
// ============================================

export function formatTime(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export function formatNumber(num, decimals = 0) {
  return Number(num).toFixed(decimals);
}

export function formatPercent(value, total) {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function timestamp() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Color utilities
export function getDirectionColor(direction) {
  const colors = {
    north: '#0ea5e9',
    south: '#8b5cf6',
    east: '#f59e0b',
    west: '#10b981',
  };
  return colors[direction] || '#94a3b8';
}

export function getDirectionGradient(direction) {
  const gradients = {
    north: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    south: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
    east: 'linear-gradient(135deg, #f59e0b, #f97316)',
    west: 'linear-gradient(135deg, #10b981, #14b8a6)',
  };
  return gradients[direction] || 'linear-gradient(135deg, #94a3b8, #64748b)';
}
