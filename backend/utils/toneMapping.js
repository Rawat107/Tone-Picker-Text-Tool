/**
 * Maps coordinate values to human-readable tone descriptions
 */

export const mapCoordinatesToTone = (coordinates) => {
  if (!coordinates || typeof coordinates.x === 'undefined' || typeof coordinates.y === 'undefined') {
    return {
      formality: 'Neutral',
      detail: 'Balanced',
      description: 'neutral and balanced'
    };
  }

  const { x, y } = coordinates;

  // Clamp values to valid range
  const clampedX = Math.max(0, Math.min(1, x));
  const clampedY = Math.max(0, Math.min(1, y));

  // Map formality (x-axis: 0 = Casual, 1 = Professional)
  let formality = '';
  if (clampedX < 0.33) {
    formality = 'very casual and conversational';
  } else if (clampedX < 0.66) {
    formality = 'moderately professional';
  } else {
    formality = 'highly professional and formal';
  }

  // Map detail level (y-axis: 0 = Concise, 1 = Expanded)
  let detail = '';
  if (clampedY < 0.33) {
    detail = 'very concise and to-the-point';
  } else if (clampedY < 0.66) {
    detail = 'moderately detailed';
  } else {
    detail = 'comprehensive and expanded with rich detail';
  }

  // Create combined description for API
  const description = `${formality}, ${detail}`;

  return {
    formality: formality.charAt(0).toUpperCase() + formality.slice(1),
    detail: detail.charAt(0).toUpperCase() + detail.slice(1),
    description
  };
};

/**
 * Maps preset names to coordinate values
 */
export const mapPresetToCoordinates = (preset) => {
  const presetMap = {
    'executive': { x: 0.85, y: 0.25 }, // Very Professional, Concise
    'technical': { x: 0.75, y: 0.85 }, // Professional, Very Detailed
    'educational': { x: 0.55, y: 0.75 }, // Balanced, Detailed
    'basic': { x: 0.25, y: 0.25 } // Casual, Concise
  };

  return presetMap[preset?.toLowerCase()] || { x: 0.5, y: 0.5 };
};

/**
 * Validates coordinate values
 */
export const validateCoordinates = (coordinates) => {
  if (!coordinates || typeof coordinates !== 'object') {
    return false;
  }

  const { x, y } = coordinates;

  return (
    typeof x === 'number' && 
    typeof y === 'number' && 
    x >= 0 && x <= 1 && 
    y >= 0 && y <= 1 &&
    !isNaN(x) && !isNaN(y)
  );
};

/**
 * Normalizes coordinate values to ensure they're within bounds
 */
export const normalizeCoordinates = (coordinates) => {
  if (!coordinates) {
    return { x: 0.5, y: 0.5 };
  }

  return {
    x: Math.max(0, Math.min(1, coordinates.x || 0.5)),
    y: Math.max(0, Math.min(1, coordinates.y || 0.5))
  };
};

/**
 * Calculates distance between two coordinate points
 */
export const calculateDistance = (coord1, coord2) => {
  const dx = coord1.x - coord2.x;
  const dy = coord1.y - coord2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Snaps coordinates to grid if they're close enough
 */
export const snapToGrid = (coordinates, gridSize = 3, snapThreshold = 0.1) => {
  const gridStep = 1 / (gridSize - 1);

  let snappedX = coordinates.x;
  let snappedY = coordinates.y;

  // Check for snap points
  for (let i = 0; i < gridSize; i++) {
    const gridX = i * gridStep;
    const gridY = i * gridStep;

    if (Math.abs(coordinates.x - gridX) < snapThreshold) {
      snappedX = gridX;
    }

    if (Math.abs(coordinates.y - gridY) < snapThreshold) {
      snappedY = gridY;
    }
  }

  return { x: snappedX, y: snappedY };
};