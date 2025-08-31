import mistralService from '../services/mistralService.js';

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class ToneController {
    async adjustTone(req, res){
        try{
            const {text, toneCoordinates, preset, previousAttempts = [] } = req.body

            console.log('Received tone adjustment request:', {
                textLength: text.length,
                toneCoordinates,
                preset,
                previousAttemptsCount: previousAttempts.length
            });

            // Validation
            if(!text || text.trim().length === 0){
                return res.status(400).json({
                    error: 'Text is required and cannot be empty.'
                })
            }

            if(text.length > 5000){
                return res.status(400).json({
                    error: 'Text exceeds the maximum length of 5000 characters.'
                })
            }

            // Generate tone description
            const toneDescription = this.generateToneDescription(toneCoordinates, preset);

            console.log('Generated tone description:', toneDescription)
            
            const casheKey = this.generateCacheKey(text, toneDescription, preset);
            const cached = cache.get(casheKey);



        } catch (error) {
            console.log('Error in adjustTone:', error.message);
            next(error);
        }
    }

    generateToneDescription(coordinates, preset) {
        if(preset) {
            const presetDescriptions = {
                executive: 'authoritative, concise, and professional with executive presence',
                technical: 'precise, detailed and technically accurate with clear explanations',
                educational: 'engaging, clear, and informative with a focus on learning',
                basic: 'simple, straightforward, and easy to understand',  
            };
            return presetDescriptions[preset.toLowerCase()] || 'neutral and balanced';
        }

        if( !coordinates || typeof coordinates.x === 'undefined' || typeof coordinates.y === 'undefined'){
            return 'neutral and balanced';
        }

        //Map coordinates to tone description
        // x-axix: 0 = casual, 1 = professional
        // y-axis: 0 = emotional, 1 = expanded

        const {x, y} = coordinates;

        let formality = '';
        let detail = '';

        //Determine fromality leve(x-axis)
        if(x < 0.33){
            formality = 'Very casual and conversational';   
        } else if(x < 0.66){
            formality = 'moderately professional';
        } else {
            formality = 'highly professional and formal';
        }

        // Determine detail level (y-axis)
        if (y < 0.33) {
            detail = 'very concise and to-the-point';
        } else if (y < 0.66) {
            detail = 'moderately detailed';
        } else {
            detail = 'comprehensive and expanded with rich detail';
        }

        return `${formality}, ${detail}`;

    }

    generateCacheKey(text, coordinates, preset){
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
            console.error('Health check failed:', error.message);
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