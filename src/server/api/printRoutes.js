const express = require('express');
const router = express.Router();
const { parseInstructions } = require('../services/nlpService');

router.post('/parse-instructions', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Field "text" is required.' });
    }

    const settings = await parseInstructions(text);
    return res.json({
      text,
      settings,
      message: 'Settings generated from instructions.',
    });
  } catch (error) {
    console.error('❌ Error processing instructions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
