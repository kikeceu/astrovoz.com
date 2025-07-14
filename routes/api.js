const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose(); // ✅ importar sqlite3
const { generarHoroscopo } = require('../services/horoscope');
const { transcribirAudio } = require('../services/whisper');

// 🔌 conectar a la base de datos
const db = new sqlite3.Database(path.join(__dirname, '../astrovoz.db'));

const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'video/webm' // 👈 agregamos esto
    ) {
      cb(null, true);
    } else {
      cb(new Error('Solo archivos de audio'));
    }
  }
});

router.post('/guardar-contacto', express.json(), (req, res) => {
  const { horoscopo_id, whatsapp, email } = req.body;

  if (!horoscopo_id || (!whatsapp && !email)) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios.' });
  }

  const stmt = db.prepare(`
    INSERT INTO contactos (horoscopo_id, whatsapp, email)
    VALUES (?, ?, ?)
  `);

  stmt.run(horoscopo_id, whatsapp || '', email || '', function (err) {
    if (err) {
      console.error('Error al guardar contacto:', err.message);
      return res.status(500).json({ mensaje: 'Error al guardar contacto.' });
    }

    res.json({ mensaje: '✅ ¡Gracias! Pronto recibirás tu horóscopo.' });
  });

  stmt.finalize();
});

router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: 'No se recibió ningún archivo.' });

    const audioPath = req.file.path;    
    const renamedPath = `${audioPath}.webm`;

    fs.renameSync(audioPath, renamedPath);

    const transcripcion = await transcribirAudio(renamedPath);
    console.log('Transcripción:', transcripcion);

    const horoscopo = await generarHoroscopo(transcripcion);

    const { jsonrepair } = require('jsonrepair');

    //data = JSON.parse(horoscopo);
    let data;
    try {
      data = JSON.parse(horoscopo);
    } catch (error) {
      try {
        data = JSON.parse(jsonrepair(horoscopo));
        console.warn('⚠️ JSON reparado automáticamente');
      } catch (finalError) {
        console.error('❌ No se pudo parsear ni reparar el JSON:', finalError.message);
        throw finalError;
      }
    }
    
    const stmt = db.prepare(`
      INSERT INTO horoscopos 
      (nombre, fecha_nacimiento, lugar_nacimiento, estado_civil, tema_consulta, transcripcion, horoscopo, ip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.nombre || '',
      data.fecha_nacimiento || '',
      data.lugar_nacimiento || '',
      data.estado_civil || '',
      data.tema || '',
      transcripcion,
      data.mensaje || '',
      req.ip || '',
      function (err) {
        fs.unlinkSync(renamedPath); // limpiar aunque haya error

        if (err) {
          console.error('Error al insertar horóscopo:', err.message);
          return res.status(500).json({ mensaje: '⚠️ Error al guardar el horóscopo.' });
        }

        const horoscopoId = this.lastID;       

        res.json({ mensaje: data.mensaje, horoscopo_id: horoscopoId });
      }
    );

    stmt.finalize();


    /*fs.unlinkSync(renamedPath);  // limpiar

    const horoscopoId = this.lastID;
    res.json({ mensaje: data.mensaje, horoscopo_id: horoscopoId });*/
  } catch (err) {
    console.error('🔴 ERROR DETECTADO EN /upload 🔴');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
      console.error('Headers:', err.response.headers);
    } else if (err.request) {
      console.error('Request error:', err.request);
    } else {
      console.error('Mensaje:', err.message);
    }
    res.status(500).json({ mensaje: '⚠️ Ocurrió un error al generar tu horóscopo.' });
    }
});

module.exports = router;