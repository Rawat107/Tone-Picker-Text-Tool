import React from 'react';

const PresetButtons = ({ onPresetSelect, disabled }) => {
  const presets = [
    {
      name: 'Executive',
      key: 'executive',
      description: 'Authoritative and concise',
      icon: '👔',
      color: 'bg-gray-600 hover:bg-gray-700',
      coordinates: { x: 0.85, y: 0.25 }
    },
    {
      name: 'Technical', 
      key: 'technical',
      description: 'Precise and detailed',
      icon: '⚙️',
      color: 'bg-blue-600 hover:bg-blue-700',
      coordinates: { x: 0.75, y: 0.85 }
    },
    {
      name: 'Educational',
      key: 'educational',
      description: 'Clear and informative', 
      icon: '📚',
      color: 'bg-green-600 hover:bg-green-700',
      coordinates: { x: 0.55, y: 0.75 }
    },
    {
      name: 'Basic',
      key: 'basic',
      description: 'Simple and straightforward',
      icon: '✨',
      color: 'bg-purple-600 hover:bg-purple-700',
      coordinates: { x: 0.25, y: 0.25 }
    }
  ];

  const handlePresetClick = (presetKey) => {
    if (!disabled) {
      console.log('🎨 Preset selected:', presetKey);
      onPresetSelect(presetKey);
    }
  };

  return (
    <section className="grid grid-cols-2 gap-3">
      {presets.map((preset) => (
        <button
          key={preset.key}
          onClick={() => handlePresetClick(preset.key)}
          disabled={disabled}
          className={`
            ${preset.color} text-white p-4 rounded-lg
            transition-all duration-200 transform
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            shadow-md hover:shadow-lg
          `}
          title={`Apply ${preset.name} tone: ${preset.description}`}
        >
          <div className="text-2xl mb-2">{preset.icon}</div>
          <div className="font-semibold text-sm">{preset.name}</div>
          <div className="text-xs opacity-90 mt-1 leading-tight">{preset.description}</div>
          <div className="text-xs opacity-75 mt-1">
            ({Math.round(preset.coordinates.x * 100)}%, {Math.round(preset.coordinates.y * 100)}%)
          </div>
        </button>
      ))}
    </section>
  );
};

export default PresetButtons;