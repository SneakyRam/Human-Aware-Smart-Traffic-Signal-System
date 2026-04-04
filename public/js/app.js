// ============================================
// SAHTCS — App Entry Point
// Initializes the dashboard controller
// ============================================

import { DashboardController } from './ui/dashboard-controller.js';

// Boot
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚦 SAHTCS — Initializing...');

  const dashboard = new DashboardController();
  await dashboard.init();

  // Expose for debugging
  window.__sahtcs = dashboard;

  console.log('🚦 SAHTCS — Ready!');
});
