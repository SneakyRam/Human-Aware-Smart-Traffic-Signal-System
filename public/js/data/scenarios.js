// ============================================
// SAHTCS — Scenario Definitions
// Rich pre-configured demo scenarios
// ============================================

export const SCENARIOS = [
  {
    id: 'balanced',
    name: 'Balanced Flow',
    icon: '⚖️',
    description: 'Equal traffic distribution',
    category: 'normal',
    data: {
      north: { vehicles: 8, pedestrians: 4, emergency: 'none', wait: 20 },
      south: { vehicles: 8, pedestrians: 4, emergency: 'none', wait: 20 },
      east:  { vehicles: 8, pedestrians: 4, emergency: 'none', wait: 20 },
      west:  { vehicles: 8, pedestrians: 4, emergency: 'none', wait: 20 },
    },
    narration: 'All directions have equal traffic. The AI balances green time fairly across all roads.'
  },
  {
    id: 'heavy_traffic',
    name: 'Heavy Traffic',
    icon: '🚗',
    description: 'Rush hour congestion',
    category: 'stress',
    data: {
      north: { vehicles: 18, pedestrians: 6, emergency: 'none', wait: 55 },
      south: { vehicles: 16, pedestrians: 5, emergency: 'none', wait: 48 },
      east:  { vehicles: 14, pedestrians: 4, emergency: 'none', wait: 42 },
      west:  { vehicles: 12, pedestrians: 7, emergency: 'none', wait: 38 },
    },
    narration: 'Peak hour scenario — all roads are congested. The AI optimizes throughput by prioritizing the most backed-up direction while preventing starvation on others.'
  },
  {
    id: 'pedestrian_rush',
    name: 'Pedestrian Rush',
    icon: '🚶',
    description: 'School zone / event dismissal',
    category: 'pedestrian',
    data: {
      north: { vehicles: 5,  pedestrians: 18, emergency: 'none', wait: 40 },
      south: { vehicles: 4,  pedestrians: 15, emergency: 'none', wait: 35 },
      east:  { vehicles: 10, pedestrians: 3,  emergency: 'none', wait: 18 },
      west:  { vehicles: 8,  pedestrians: 2,  emergency: 'none', wait: 20 },
    },
    narration: 'Massive pedestrian flow on North and South — the AI extends crossing phases and reduces vehicle green time to protect pedestrians.'
  },
  {
    id: 'emergency_ambulance',
    name: 'Emergency: Ambulance',
    icon: '🚑',
    description: 'Critical medical emergency',
    category: 'emergency',
    data: {
      north: { vehicles: 12, pedestrians: 5, emergency: 'none', wait: 30 },
      south: { vehicles: 9,  pedestrians: 3, emergency: 'none', wait: 25 },
      east:  { vehicles: 6,  pedestrians: 2, emergency: 'ambulance', wait: 10 },
      west:  { vehicles: 15, pedestrians: 8, emergency: 'none', wait: 45 },
    },
    narration: '🚨 EMERGENCY — Ambulance detected on East approach! AI immediately clears the green corridor, overriding normal priority. West has high traffic but must yield.'
  },
  {
    id: 'emergency_conflict',
    name: 'Dual Emergency',
    icon: '🚨',
    description: 'Two emergency vehicles conflict',
    category: 'emergency',
    data: {
      north: { vehicles: 15, pedestrians: 3, emergency: 'none', wait: 40 },
      south: { vehicles: 9,  pedestrians: 12, emergency: 'none', wait: 32 },
      east:  { vehicles: 6,  pedestrians: 2, emergency: 'ambulance', wait: 18 },
      west:  { vehicles: 7,  pedestrians: 1, emergency: 'firetruck', wait: 21 },
    },
    narration: '🚨 CONFLICT — Both Ambulance (East) and Fire Truck (West) are approaching! The AI resolves the conflict by giving priority to the higher-priority emergency (Ambulance > Fire Truck).'
  },
  {
    id: 'peak_hour',
    name: 'Peak Hour Chaos',
    icon: '⏰',
    description: 'Maximum stress test',
    category: 'stress',
    data: {
      north: { vehicles: 20, pedestrians: 10, emergency: 'none', wait: 65 },
      south: { vehicles: 18, pedestrians: 8,  emergency: 'police', wait: 50 },
      east:  { vehicles: 15, pedestrians: 6,  emergency: 'ambulance', wait: 35 },
      west:  { vehicles: 17, pedestrians: 9,  emergency: 'none', wait: 55 },
    },
    narration: '🔥 MAXIMUM STRESS — All roads saturated, multiple emergencies active. Watch the AI balance emergency priority with extreme congestion management.'
  },
  {
    id: 'night_mode',
    name: 'Night Mode',
    icon: '🌙',
    description: 'Low traffic, energy saving',
    category: 'normal',
    data: {
      north: { vehicles: 2, pedestrians: 0, emergency: 'none', wait: 5 },
      south: { vehicles: 1, pedestrians: 1, emergency: 'none', wait: 8 },
      east:  { vehicles: 3, pedestrians: 0, emergency: 'none', wait: 3 },
      west:  { vehicles: 0, pedestrians: 0, emergency: 'none', wait: 0 },
    },
    narration: 'Late night — minimal traffic. The AI switches to energy-saving mode with shorter cycle times and longer all-red safety intervals.'
  },
];

export function getScenarioById(id) {
  return SCENARIOS.find(s => s.id === id);
}

export default SCENARIOS;
