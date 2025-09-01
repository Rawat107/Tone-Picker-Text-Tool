import React, { useState, useRef, useCallback, useEffect } from 'react';

const TonePicker = ({ coordinates, onChange, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const gridRef = useRef(null);
  const animationRef = useRef(null);

  const handlePointerDown = useCallback((e) => {
    if (disabled) return;

    e.preventDefault();
    setIsDragging(true);

    // Add pointer capture for better drag behavior
    if (e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
  }, [disabled]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || disabled || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // Throttle updates for smooth performance
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(() => {
      onChange({ x, y });
    });
  }, [isDragging, disabled, onChange]);

  const handlePointerUp = useCallback((e) => {
    setIsDragging(false);

    // Release pointer capture
    if (e.target.releasePointerCapture) {
      e.target.releasePointerCapture(e.pointerId);
    }
  }, []);

  const handleGridClick = useCallback((e) => {
    if (disabled || !gridRef.current || isDragging) return;

    const rect = gridRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    onChange({ x, y });
  }, [disabled, onChange, isDragging]);

  // Add global pointer event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (e) => handlePointerMove(e);
      const handleGlobalUp = (e) => handlePointerUp(e);

      document.addEventListener('pointermove', handleGlobalMove);
      document.addEventListener('pointerup', handleGlobalUp);
      document.addEventListener('pointercancel', handleGlobalUp);

      return () => {
        document.removeEventListener('pointermove', handleGlobalMove);
        document.removeEventListener('pointerup', handleGlobalUp);
        document.removeEventListener('pointercancel', handleGlobalUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const getToneDescription = () => {
    const { x, y } = coordinates;

    let formality = '';
    let detail = '';

    // Map formality (x-axis)
    if (x < 0.33) formality = 'Casual';
    else if (x < 0.66) formality = 'Balanced';
    else formality = 'Professional';

    // Map detail level (y-axis)
    if (y < 0.33) detail = 'Concise';
    else if (y < 0.66) detail = 'Moderate';
    else detail = 'Expanded';

    return `${formality} • ${detail}`;
  };

  return (
    <section className="space-y-4">
      {/* Axis Labels */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-600">
        <span>← Casual</span>
        <span>Professional →</span>
      </div>

      {/* Main Grid Container */}
      <div className="relative">
        {/* Y-axis label */}
        <div className="absolute mt-5 -left-13 top-0 h-full flex flex-col gap-y-60 items-center text-sm font-medium text-gray-600 py-2">
          <span className="transform -rotate-90 whitespace-nowrap origin-center">Concise →</span>
          <span className="transform -rotate-90 whitespace-nowrap origin-center">← Expanded</span>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className={`
            relative w-full h-80 border-2 rounded-lg cursor-crosshair
            tone-picker-grid select-none touch-none
            ${disabled ? 'opacity-50 cursor-not-allowed border-gray-300' : 'border-gray-300 hover:border-blue-400'}
            ${isHovering && !disabled ? 'border-blue-400' : ''}
            transition-colors duration-200
          `}
          onClick={handleGridClick}
          onPointerEnter={() => setIsHovering(true)}
          onPointerLeave={() => setIsHovering(false)}
        >
          {/* Grid Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical lines */}
            <div className="absolute left-1/3 top-0 w-px h-full bg-gray-300 opacity-60"></div>
            <div className="absolute left-2/3 top-0 w-px h-full bg-gray-300 opacity-60"></div>
            {/* Horizontal lines */}
            <div className="absolute top-1/3 left-0 w-full h-px bg-gray-300 opacity-60"></div>
            <div className="absolute top-2/3 left-0 w-full h-px bg-gray-300 opacity-60"></div>
          </div>

          {/* Corner Labels */}
          <div className="absolute top-2 left-2 text-xs text-gray-400 font-medium">Casual & Concise</div>
          <div className="absolute top-2 right-2 text-xs text-gray-400 font-medium">Professional & Concise</div>
          <div className="absolute bottom-2 left-2 text-xs text-gray-400 font-medium">Casual & Expanded</div>
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-medium">Professional & Expanded</div>

          {/* Tone Pointer */}
          <div
            className={`
              absolute w-8 h-8 rounded-full border-4 border-white shadow-lg
              tone-pointer transform -translate-x-1/2 -translate-y-1/2 z-10
              ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 cursor-grab'}
              ${isDragging ? 'cursor-grabbing scale-110 shadow-xl' : ''}
              ${isHovering && !disabled ? 'scale-105' : ''}
            `}
            style={{
              left: `${coordinates.x * 100}%`,
              top: `${coordinates.y * 100}%`,
            }}
            onPointerDown={handlePointerDown}
          >
            {/* Pulse animation when not dragging */}
            {!isDragging && !disabled && (
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-40"></div>
            )}

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Selection Display */}
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-lg font-semibold text-blue-800 mb-1">
          {getToneDescription()}
        </div>
        <div className="text-sm text-blue-600">
          Position: ({Math.round(coordinates.x * 100)}%, {Math.round(coordinates.y * 100)}%)
        </div>
        {disabled && (
          <div className="text-xs text-gray-500 mt-1">
            Enter text to enable tone adjustment
          </div>
        )}
      </div>
    </section>
  );
};

export default TonePicker;