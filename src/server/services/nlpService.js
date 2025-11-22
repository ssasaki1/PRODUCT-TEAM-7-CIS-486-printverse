require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This function sends user text to the model and extracts printer settings
async function parseInstructions(text) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or "gpt-4-turbo" if you have access
      messages: [
        {
          role: 'system',
          content: `You are a printer configuration assistant. 
          Given any natural language instruction from the user, 
          extract printer settings in JSON with these fields:
          - copies (number)
          - color ("color" or "mono")
          - duplex (true/false)
          - paperSize (e.g. "A4", "Letter", "Legal")
          - orientation ("portrait" or "landscape")`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.2,
    });

    const raw = response.choices[0].message.content;

    // Try to safely parse the JSON output
    let cleaned = raw
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

    let settings = {};
    try {
        settings = JSON.parse(cleaned);
    } catch (e) {
    console.warn('Model returned non-JSON output. Using raw text.');
    settings = { rawResponse: cleaned };
    }

    return settings;
  } catch (error) {
    console.error('Error in parseInstructions:', error);
    return { error: 'Failed to interpret instructions.' };
  }
}

module.exports = { parseInstructions };
