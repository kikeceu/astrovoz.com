const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = express.Router();

const db = new sqlite3.Database(path.join(__dirname, '../astrovoz.db'));

// Ruta GET /admin
router.get('/', (req, res) => {
  const query = `
    SELECT h.id AS horoscopo_id, h.nombre, h.fecha_nacimiento, h.lugar_nacimiento, 
           c.email, c.whatsapp, h.estado_civil, h.tema_consulta, h.horoscopo
    FROM horoscopos h
    LEFT JOIN contactos c ON h.id = c.horoscopo_id
    ORDER BY h.creado_en DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err.message);
      return res.status(500).send('Error al cargar los horóscopos.');
    }

    // Renderizamos en HTML básico
    const html = `
      <html>
        <head>
          <title>Panel Admin - Astrovoz</title>
          <style>
            body { font-family: sans-serif; padding: 20px; background: #f9f9f9; }
            .card { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 0 10px #ddd; }
            .dato { margin-bottom: 5px; }
            .texto { white-space: pre-wrap; margin-top: 10px; background: #f3f3f3; padding: 10px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>Horóscopos generados</h1>
          ${rows.map(row => `
            <div class="card">
              <div class="dato"><strong>Nombre:</strong> ${row.nombre}</div>
              <div class="dato"><strong>Fecha Nacimiento:</strong> ${row.fecha_nacimiento}</div>
              ${row.lugar_nacimiento ? `<div class="dato"><strong>Lugar Nacimiento:</strong> ${row.lugar_nacimiento}</div>` : ''}
              ${row.estado_civil ? `<div class="dato"><strong>Estado Civil:</strong> ${row.estado_civil}</div>` : ''}
              ${row.email ? `<div class="dato"><strong>Email:</strong> ${row.email}</div>` : ''}
              ${row.whatsapp ? `<div class="dato"><strong>Teléfono:</strong> ${row.whatsapp}</div>` : ''}
              <div class="texto">${row.horoscopo}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    res.send(html);
  });
});

module.exports = router;