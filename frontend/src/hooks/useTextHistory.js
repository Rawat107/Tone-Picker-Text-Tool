import { useState, useCallback, useRef } from 'react';

const useTextHistory = (initialText = '') => {
  const [history, setHistory] = useState([initialText].filter(Boolean));
  const [currentIndex, setCurrentIndex] = useState(initialText ? 0 : -1);
  const lastAddedRef = useRef(Date.now());

  const addToHistory = useCallback((text) => {
    if (!text || text.trim().length === 0) return;

    const now = Date.now();

    // Debounce rapid additions (within 1000ms)
    if (now - lastAddedRef.current < 1000) {
      // Replace the last entry instead of adding new one
      setHistory(prev => {
        if (prev.length === 0) return [text];
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = text;
        return newHistory;
      });
      return;
    }

    lastAddedRef.current = now;

    setHistory(prev => {
      // If we're not at the end of history, remove everything after current index
      const newHistory = currentIndex >= 0 ? prev.slice(0, currentIndex + 1) : [];
      newHistory.push(text);

      // Limit history to 20 entries for performance
      if (newHistory.length > 20) {
        newHistory.shift();
        setCurrentIndex(newHistory.length - 1);
        return newHistory;
      }

      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      console.log('↶ Undo to index:', newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      console.log('↷ Redo to index:', newIndex);
      return history[newIndex];
    }
    return null;
  }, [currentIndex, history]);

  const reset = useCallback(() => {
    if (history.length > 0) {
      setCurrentIndex(0);
      console.log(' Reset to first entry');
      return history[0];
    }
    return null;
  }, [history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    history,
    currentIndex,
    addToHistory,
    undo,
    redo,
    reset,
    canUndo,
    canRedo
  };
};

export default useTextHistory;