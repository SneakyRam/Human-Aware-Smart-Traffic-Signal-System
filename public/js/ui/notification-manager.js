// ============================================
// SAHTCS — Notification Manager
// Toast notifications & emergency alerts
// ============================================

import { create, el } from '../utils/dom-helpers.js';

export class NotificationManager {
  constructor() {
    this.container = null;
    this.logFeed = null;
    this.logEntries = [];
    this.maxLogs = 50;
  }

  init() {
    // Create toast container if not present
    this.container = el('toast-container');
    if (!this.container) {
      this.container = create('div', {
        id: 'toast-container',
        className: 'toast-container'
      });
      document.body.appendChild(this.container);
    }

    this.logFeed = el('log-feed');
  }

  /**
   * Show a toast notification.
   */
  showToast(options) {
    const { title, message, icon = '📋', type = 'info', duration = 4000 } = options;

    const toast = create('div', { className: `toast toast-${type}` }, [
      create('span', { className: 'toast-icon', textContent: icon }),
      create('div', { className: 'toast-content' }, [
        create('div', { className: 'toast-title', textContent: title }),
        create('div', { className: 'toast-message', textContent: message }),
      ]),
    ]);

    this.container.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Show emergency alert toast.
   */
  showEmergencyAlert(alerts) {
    if (!alerts || alerts.length === 0) return;

    alerts.forEach(alert => {
      this.showToast({
        title: alert.title,
        message: alert.message,
        icon: alert.severity === 'critical' ? '🚨' : '⚠️',
        type: alert.severity === 'critical' ? 'danger' : 'warning',
        duration: 5000,
      });
    });
  }

  /**
   * Add entry to the decision log.
   */
  addLog(type, message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const entry = { type, message, time: timeStr };
    this.logEntries.unshift(entry);

    if (this.logEntries.length > this.maxLogs) {
      this.logEntries.pop();
    }

    this._renderLog();
  }

  /**
   * Render the log feed.
   */
  _renderLog() {
    if (!this.logFeed) return;
    this.logFeed.innerHTML = '';

    this.logEntries.slice(0, 15).forEach(entry => {
      const row = create('div', { className: `log-entry ${entry.type}` }, [
        create('span', { className: 'log-time', textContent: entry.time }),
        create('span', { className: 'log-msg', textContent: entry.message }),
      ]);
      this.logFeed.appendChild(row);
    });
  }

  clear() {
    this.logEntries = [];
    if (this.logFeed) this.logFeed.innerHTML = '';
  }
}

export default NotificationManager;
