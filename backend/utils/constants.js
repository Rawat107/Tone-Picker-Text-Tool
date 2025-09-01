// Tone mapping constants
export const TONE_PRESETS = {
  EXECUTIVE: 'executive',
  TECHNICAL: 'technical', 
  EDUCATIONAL: 'educational',
  BASIC: 'basic'
};

export const TONE_COORDINATES = {
  // Predefined coordinates for presets
  [TONE_PRESETS.EXECUTIVE]: { x: 0.85, y: 0.25 }, // Professional, Concise
  [TONE_PRESETS.TECHNICAL]: { x: 0.75, y: 0.85 }, // Professional, Expanded
  [TONE_PRESETS.EDUCATIONAL]: { x: 0.55, y: 0.75 }, // Balanced, Expanded
  [TONE_PRESETS.BASIC]: { x: 0.25, y: 0.25 } // Casual, Concise
};

export const API_ENDPOINTS = {
  TONE_ADJUST: '/tone/adjust',
  HEALTH_CHECK: '/tone/health'
};

export const MAX_TEXT_LENGTH = 5000;
export const MAX_HISTORY_SIZE = 20;
export const DEBOUNCE_DELAY = 1000;

export const TONE_AXIS_LABELS = {
  X_AXIS: {
    MIN: 'Casual',
    MAX: 'Professional'
  },
  Y_AXIS: {
    MIN: 'Concise', 
    MAX: 'Expanded'
  }
};

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const REQUEST_TIMEOUT = 30000; // 30 seconds