import mistralService from '../services/mistralService.js';
import { mapCoordinatesToTone } from '../utils/toneMapping.js';
import { CACHE_DURATION, MAX_TEXT_LENGTH } from '../utils/constants.js';

const cache = new Map();

class ToneController {


    adjustTone = async (req, res, next) => {
        try {
            const { text, toneCoordinates, preset, previousAttempts = [] } = req.body;

            console.log(' Received tone adjustment request:', {
                textLength: text?.length,
                toneCoordinates,
                preset,
                previousAttemptsCount: previousAttempts.length
            });

            // Validation using constants
            if (!text || text.trim().length === 0) {
                return res.status(400).json({
                    error: 'Text is required and cannot be empty.'
                });
            }

            if (text.length > MAX_TEXT_LENGTH) {
                return res.status(400).json({
                    error: `Text exceeds the maximum length of ${MAX_TEXT_LENGTH} characters.`
                });
            }

            // Generate tone description
            const toneDescription = this.generateToneDescription(toneCoordinates, preset);
            console.log(' Generated tone description:', toneDescription);

            // Check cache
            const cacheKey = this.generateCacheKey(text, toneCoordinates, preset);
            const cached = cache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                console.log(' Returning cached result');
                return res.json({
                    adjustedText: cached.result,
                    toneDescription,
                    cached: true,
                    timestamp: new Date().toISOString()
                });
            }

            // Call Mistral AI
            console.log(' Calling Mistral AI...');
            const result = await mistralService.adjustTone(text, toneDescription, previousAttempts);

            // Cache the result
            cache.set(cacheKey, {
                result: result.adjustedText,
                timestamp: Date.now()
            });

            // Clean up old cache entries
            this.cleanupCache();

            console.log(' Tone adjustment completed successfully');

            res.json({
                adjustedText: result.adjustedText,
                toneDescription,
                usage: result.usage,
                cached: false,
                model: result.model,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error(' Error in tone adjustment:', error.message);
            next(error);
        }
    }

    generateToneDescription(coordinates, preset) {
        if (preset) {
            const presetDescriptions = {
                executive: 'authoritative, concise, and professional with executive presence',
                technical: 'precise, detailed, and technically accurate with clear explanations',
                educational: 'clear, informative, and accessible for learning purposes',
                basic: 'simple, straightforward, and easy to understand'
            };
            return presetDescriptions[preset.toLowerCase()] || 'neutral and balanced';
        }

        if (!coordinates || typeof coordinates.x === 'undefined' || typeof coordinates.y === 'undefined') {
            return 'neutral and balanced';
        }

        // Use the toneMapping utility
        const toneMapping = mapCoordinatesToTone(coordinates);
        return toneMapping.description;
    }

    generateCacheKey(text, coordinates, preset) {
        const textSample = text.substring(0, 100);
        const coordStr = coordinates ? `${coordinates.x.toFixed(2)}_${coordinates.y.toFixed(2)}` : 'null';
        return `${textSample}_${coordStr}_${preset || 'none'}`;
    }

    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                cache.delete(key);
            }
        }
    }

    async healthCheck(req, res) {
        try {
            console.log(' Performing health check...');
            const isValid = await mistralService.validateApiKey();

            res.json({
                status: 'OK',
                mistralApiConnected: isValid,
                cacheSize: cache.size,
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV
            });
        } catch (error) {
            console.error(' Health check failed:', error.message);
            res.status(500).json({
                status: 'ERROR',
                mistralApiConnected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}

export default new ToneController();