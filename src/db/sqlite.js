const sqlite3 = require('sqlite3').verbose();

// Crear/conectar a la base de datos (archivo astrovoz.db en el root)
const db = new sqlite3.Database('./astrovoz.db', (err) => {
  if (err) {
    console.error('❌ Error al conectar con SQLite:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite');

    // Crear tabla horoscopos si no existe
    db.run(`
      CREATE TABLE IF NOT EXISTS horoscopos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        fecha_nacimiento TEXT,
        lugar_nacimiento TEXT,
        estado_civil TEXT,
        tema_consulta TEXT,
        transcripcion TEXT,
        horoscopo TEXT NOT NULL,
        ip TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla contactos si no existe
    db.run(`
      CREATE TABLE IF NOT EXISTS contactos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        horoscopo_id INTEGER NOT NULL,
        whatsapp TEXT,
        email TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (horoscopo_id) REFERENCES horoscopos(id) ON DELETE CASCADE
      )
    `);
  }
});