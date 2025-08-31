import { useState, useCallback } from 'react';
import api from '../services/api';

const useToneAdjustment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const adjustTone = useCallback(async (text, toneCoordinates, preset, previousAttempts = []) => {
    if (!text || !text.trim()) {
      throw new Error('Text cannot be empty');
    }

    console.log('🎯 Starting tone adjustment...', {
      textLength: text.length,
      toneCoordinates,
      preset,
      previousAttempts: previousAttempts.length
    });

    setIsLoading(true);
    setError(null);

    try {
      const requestData = {
        text: text.trim(),
        toneCoordinates,
        preset,
        previousAttempts
      };

      console.log('📤 Sending request to API...');
      const response = await api.post('/tone/adjust', requestData);

      console.log('📥 Received response:', {
        success: true,
        cached: response.data.cached,
        textLength: response.data.adjustedText?.length
      });

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to adjust tone';

      console.error('❌ Tone adjustment failed:', {
        error: errorMessage,
        status: err.response?.status,
        data: err.response?.data
      });

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    adjustTone,
    isLoading,
    error,
    clearError
  };
};

export default useToneAdjustment;