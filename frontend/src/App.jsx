import React, { useState, useCallback, useEffect } from 'react';
import { FaUndo, FaRedo } from "react-icons/fa";
import { MdRefresh, MdReplay } from "react-icons/md";
import TextEditor from './components/TextEditor';
import TonePicker from './components/TonePicker';
import PresetButtons from './components/PresetButtons';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import useTextHistory from './hooks/useTextHistory';
import useToneAdjustment from './hooks/useToneAdjustment';
import useLocalStorage from './hooks/useLocalStorage';

function App() {
  const [originalText, setOriginalText] = useLocalStorage('originalText', '');
  const [currentText, setCurrentText] = useLocalStorage('currentText', '');
  const [toneCoordinates, setToneCoordinates] = useLocalStorage('toneCoordinates', { x: 0.5, y: 0.5 });

  const { history, currentIndex, addToHistory, undo, redo, canUndo, canRedo, reset } = useTextHistory(currentText);
  const { adjustTone, isLoading, error, clearError } = useToneAdjustment();

  // Initialize original text when current text is first set
  useEffect(() => {
    if (currentText && !originalText) {
      setOriginalText(currentText);
    }
  }, [currentText, originalText, setOriginalText]);

  // Handle text changes from the editor
  const handleTextChange = useCallback((newText) => {
    setCurrentText(newText);
    if (!originalText && newText.trim()) {
      setOriginalText(newText);
    }
  }, [originalText, setCurrentText, setOriginalText]);

  // Handle tone coordinate changes (dragging the pointer)
  const handleToneChange = useCallback(async (coordinates) => {
    if (!currentText.trim()) {
      console.warn('No text to adjust');
      return;
    }

    setToneCoordinates(coordinates);

    try {
      console.log(' Adjusting tone with coordinates:', coordinates);
      const result = await adjustTone(currentText, coordinates);

      if (result.adjustedText && result.adjustedText !== currentText) {
        setCurrentText(result.adjustedText);
        addToHistory(result.adjustedText);
        console.log(' Tone adjustment completed');
      }
    } catch (err) {
      console.error(' Tone adjustment failed:', err);
    }
  }, [currentText, adjustTone, setCurrentText, addToHistory, setToneCoordinates]);

  // Handle preset selection
  const handlePresetSelect = useCallback(async (preset) => {
    if (!currentText.trim()) {
      console.warn('No text to adjust');
      return;
    }

    try {
      console.log(' Applying preset:', preset);
      const result = await adjustTone(currentText, null, preset);

      if (result.adjustedText && result.adjustedText !== currentText) {
        setCurrentText(result.adjustedText);
        addToHistory(result.adjustedText);

        // Update coordinates to match preset
        const presetCoordinates = getPresetCoordinates(preset);
        setToneCoordinates(presetCoordinates);
        console.log(' Preset applied successfully');
      }
    } catch (err) {
      console.error(' Preset application failed:', err);
    }
  }, [currentText, adjustTone, setCurrentText, addToHistory, setToneCoordinates]);

  // Get preset coordinates
  const getPresetCoordinates = (preset) => {
    const presetMap = {
      'executive': { x: 0.85, y: 0.25 },
      'technical': { x: 0.75, y: 0.85 },
      'educational': { x: 0.55, y: 0.75 },
      'basic': { x: 0.25, y: 0.25 }
    };
    return presetMap[preset.toLowerCase()] || { x: 0.5, y: 0.5 };
  };

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    const previousText = undo();
    if (previousText !== null) {
      setCurrentText(previousText);
      console.log('↶ Undo applied');
    }
  }, [undo, setCurrentText]);

  const handleRedo = useCallback(() => {
    const nextText = redo();
    if (nextText !== null) {
      setCurrentText(nextText);
      console.log('↷ Redo applied');
    }
  }, [redo, setCurrentText]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (originalText) {
      setCurrentText(originalText);
      addToHistory(originalText);
      setToneCoordinates({ x: 0.5, y: 0.5 });
      console.log(' Reset to original text');
    }
  }, [originalText, setCurrentText, addToHistory, setToneCoordinates]);

  // Try again with same settings
  const handleTryAgain = useCallback(async () => {
    if (!currentText.trim()) {
      console.warn('No text to try again with');
      return;
    }

    try {
      console.log(' Trying again with same settings...');
      // Get previous attempts for better variation
      const previousAttempts = history.slice(Math.max(0, history.length - 3));
      const result = await adjustTone(currentText, toneCoordinates, null, previousAttempts);

      if (result.adjustedText && result.adjustedText !== currentText) {
        setCurrentText(result.adjustedText);
        addToHistory(result.adjustedText);
        console.log(' Try again completed');
      }
    } catch (err) {
      console.error(' Try again failed:', err);
    }
  }, [currentText, toneCoordinates, history, adjustTone, setCurrentText, addToHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Tone Picker Text Tool
          </h1>
          <p className="text-gray-600 text-lg">
            Adjust your text tone with AI-powered precision
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={clearError}
          />
        )}

        {/* Loading Indicator */}
        {isLoading && <LoadingIndicator />}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Text Editor */}
          <div className="space-y-4">
            <TextEditor
              text={currentText}
              onChange={handleTextChange}
              placeholder="Enter your text here to adjust its tone..."
              disabled={isLoading}
            />

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleUndo}
                disabled={!canUndo || isLoading}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <FaUndo /> Undo
              </button>

              <button
                onClick={handleRedo}
                disabled={!canRedo || isLoading}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <FaRedo /> Redo
              </button>

              <button
                onClick={handleReset}
                disabled={!originalText || isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <MdRefresh /> Reset
              </button>

              <button
                onClick={handleTryAgain}
                disabled={!currentText.trim() || isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <MdReplay /> Try Again
              </button>
            </div>


            {/* History Display */}
            {history.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="font-semibold text-gray-700 mb-2">History ({currentIndex + 1}/{history.length})</h4>
                <div className="text-sm text-gray-500">
                  {history[currentIndex] ? `"${history[currentIndex].substring(0, 100)}..."` : 'No history'}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Tone Controls */}
          <div className="space-y-6">
            {/* Tone Picker Matrix */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Tone Picker
              </h3>
              <TonePicker
                coordinates={toneCoordinates}
                onChange={handleToneChange}
                disabled={isLoading || !currentText.trim()}
              />
            </div>

            {/* Preset Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Quick Presets
              </h3>
              <PresetButtons
                onPresetSelect={handlePresetSelect}
                disabled={isLoading || !currentText.trim()}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500">
          <p>Powered by Mistral AI • Built with React & TailwindCSS 4.1</p>
        </footer>
      </div>
    </div>
  );
}

export default App;