const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

async function transcribirAudio(audioPath) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath));
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        }
      }
    );

    return response.data.text;
  } catch (error) {
    console.error('Error en Whisper:', error.response?.data || error.message);
    throw new Error('No se pudo transcribir el audio');
  }
}

module.exports = {
  transcribirAudio
};