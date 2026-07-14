const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// ─── Middlewares globales ────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

// ─── Rutas ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/convenios', require('./routes/convenios'));
app.use('/api/movilidades', require('./routes/movilidad'));

// ─── Ruta raíz (health check) ────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    mensaje: 'API Convenios UNDAC funcionando'
  });
});

// ─── Manejo de rutas no encontradas ──────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Iniciar servidor ────────────────────────────────────────
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});