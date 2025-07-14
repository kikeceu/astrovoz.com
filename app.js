const express = require('express');
const app = express();
const PORT = 7272;

app.use(express.static('public')); // para servir el frontend

app.listen(PORT, () => {
  console.log(`Astrovoz corriendo en http://astrovoz.local:${PORT}`);
});

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

require('./src/db/sqlite');