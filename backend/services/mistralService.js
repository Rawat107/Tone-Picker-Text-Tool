import axios from 'axios';
import { REQUEST_TIMEOUT } from '../utils/constants.js';
import dotenv from 'dotenv';
dotenv.config();

class MistralService {
    constructor() {
        this.apiKey = process.env.MISTRAL_API_KEY;
        this.baseUrl = 'https://api.mistral.ai/v1';
        this.model = 'mistral-small-latest';

        if (!this.apiKey) {
            throw new Error('MISTRAL_API_KEY is not set in environment variables');
        }

        console.log(' MistralService initialized with model:', this.model);
        console.log(' API Key configured:', this.apiKey.substring(0, 10) + '...');
    }

    async adjustTone(text, toneDescription, previousAttempts = []) {
        try {
            console.log(' Adjusting tone:', toneDescription);
            console.log(' Text length:', text.length);

            const prompt = this.createTonePrompt(text, toneDescription, previousAttempts);

            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: Math.min(1500, text.length * 2),
                    top_p: 0.9
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: REQUEST_TIMEOUT // Using constant
                }
            );

            const adjustedText = response.data.choices[0].message.content.trim();
            console.log(' Tone adjustment successful. Adjusted text length:', adjustedText.length);

            return {
                success: true,
                adjustedText,
                usage: response.data.usage,
                model: this.model
            };

        } catch (error) {
            console.error(' Mistral API Error:', error.response?.data || error.message);

            if (error.response?.status === 401) {
                throw new Error('Invalid API Key for Mistral. Please check your configuration.');
            } else if (error.response?.status === 429) {
                throw new Error('Rate limit exceeded for Mistral API. Please try again later.');
            } else if (error.response?.status >= 500) {
                throw new Error('Mistral AI service is temporarily unavailable. Please try again later.');
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Request to Mistral API timed out. Please try again.');
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                throw new Error('Unable to connect to Mistral AI. Please check your internet connection.');
            }

            throw new Error(`Failed to adjust tone: ${error.message}`);
        }
    }

    createTonePrompt(text, toneDescription, previousAttempts) {
        let prompt = `Please rewrite the following text to match this specific tone and style: ${toneDescription}

Original Text: "${text}"

IMPORTANT INSTRUCTIONS:
- Maintain the exact same meaning and core information
- Adjust ONLY the writing style, formality level, and level of detail to match the tone description
- Keep the same approximate length of the text unless the tone specifically requires expansion or conciseness
- Ensure the output sounds natural and coherent
- Do not add any new information or change the factual content
- Return only the rewritten text, without any additional commentary or explanation
- If the tone description is unclear or contradictory, use your best judgment to interpret it in a way that enhances the text while staying true to the original meaning`;

        // If there are previous attempts, include them to get variation
        if (previousAttempts.length > 0) {
            prompt += `

Previous versions that were generated (provide a different interpretation):
${previousAttempts.map((attempt, index) => `${index + 1}. "${attempt}"`).join('\n')}

Please provide a fresh take on the tone while maintaining the original meaning.`;
        }

        return prompt;
    }

    async validateApiKey() {
        try {
            console.log('🔍 Validating Mistral API Key...');

            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: this.model,
                    messages: [{ role: 'user', content: 'Test' }],
                    max_tokens: 5
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 seconds timeout
                }
            );

            console.log(' Mistral API Key validation successful');
            return true;
        } catch (error) {
            console.error(' API key validation failed:', error.response?.data || error.message);
            return false;
        }
    }
}

export default new MistralService();