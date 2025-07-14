const axios = require('axios');
require('dotenv').config();

async function generarHoroscopo(transcripcion) {
  /*const prompt = `
Sos una astróloga profesional, cálida y empática. Un usuario te ha enviado un mensaje de voz, transcrito a continuación. Extraé de esa transcripción su nombre, fecha y lugar de nacimiento, estado civil y el tema sobre el que desea una orientación (amor, dinero, trabajo, etc.).

Usá esa información para crear un horóscopo **personalizado** para esa persona, teniendo en cuenta su energía astral de base, su contexto emocional y lo que está atravesando en este momento. Sé cercana, espiritual y clara. 

No uses frases vacías o genéricas, ni repitas estructuras. Si no hay suficiente información sobre un área (ej: no menciona dinero), enfocá la respuesta en lo que sí dijo. Si detectás estado civil o lugar de nacimiento, usalos para hacer que el mensaje suene único.

Mensaje del usuario (voz transcripta):
"""
${transcripcion}
"""
`;*/

  const prompt = `
Sos una astróloga profesional, cálida y empática. Un usuario te ha enviado un mensaje de voz, cuya transcripción se muestra abajo. A partir de esa transcripción:

1. Extraé la mayor cantidad posible de los siguientes datos (si están presentes):
- nombre completo
- fecha de nacimiento
- lugar de nacimiento
- estado civil
- tema principal de interés

2. Luego, en base a esos datos y a lo que el usuario expresó en su mensaje, generá un **horóscopo altamente personalizado**, con tono espiritual, profundo y cercano. No repitas frases vacías ni uses lugares comunes. Si no hay suficiente información sobre alguna área, enfocá la respuesta en lo que sí dijo.

Respondé exclusivamente en formato JSON, como este ejemplo:

{
  "nombre": "Valeria Gómez",
  "fecha_nacimiento": "4 de mayo de 1986",
  "lugar_nacimiento": "Mendoza",
  "estado_civil": "soltera",
  "tema": "amor",
  "mensaje": "**✨ Predicción general**: Esta semana las energías planetarias te impulsan a mirar hacia adentro. ...

**❤️ Amor**: Nuevas conexiones pueden surgir si abrís tu corazón...

**💼 Trabajo**: Estás en una etapa de transformación profesional...

**💰 Dinero**: Evitá gastos impulsivos y sé prudente..."
}

Transcripción del mensaje del usuario:
"""
${transcripcion}
"""
`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Sos una astróloga profesional y espiritual.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = {
  generarHoroscopo
};