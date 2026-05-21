const pool = require('../config/db');

// ─── seccion listar /api/convenios ──────────────────────────────────────

exports.listar = async (req, res) => {
  const { ambito, busqueda } = req.query;

  let query  = 'SELECT * FROM convenios WHERE true';
  const params = [];

  if (ambito && ambito.toLowerCase() !== 'todos') {
    params.push(ambito);
    query += ` AND LOWER(ambito) = LOWER($${params.length})`;
  }

  if (busqueda) {
    params.push(`%${busqueda}%`);
    query += ` AND (nombre ILIKE $${params.length} OR resolucion ILIKE $${params.length})`;
  }

  query += ' ORDER BY creado_en DESC';

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error al listar convenios:', err);
    res.status(500).json({ error: 'Error al obtener convenios' });
  }
};

// ─── seccion obtener /api/convenios/:id ──────────────────────────────────
exports.obtener = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM convenios WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Convenio no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener convenio:', err);
    res.status(500).json({ error: 'Error al obtener convenio' });
  }
};

// ─── seccion crear /api/convenios ─────────────────────────────────────
exports.crear = async (req, res) => {
  const {
    nombre, ambito, tipo, inicio, fin, duracion, resolucion,
    resultados, otros,
    practicas, investigaciones, proyeccion, capacitacion, laboral, pasantia, movilidad,
  } = req.body;

  if (!nombre || !inicio || !fin || !ambito) {
    return res.status(400).json({ error: 'Campos requeridos: nombre, ambito, inicio, fin' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO convenios
        (nombre, ambito, tipo, inicio, fin, duracion, resolucion, resultados, otros,
         practicas, investigaciones, proyeccion, capacitacion, laboral, pasantia, movilidad,
         creado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        nombre, ambito, tipo || null, inicio, fin,
        duracion || null, resolucion || null, resultados || null, otros || null,
        !!practicas, !!investigaciones, !!proyeccion, !!capacitacion,
        !!laboral, !!pasantia, !!movilidad,
        req.usuario.id,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error al crear convenio:', err);
    res.status(500).json({ error: 'Error al crear convenio' });
  }
};

// ─── seccion actualizar /api/convenios/:id ──────────────────────────────────
exports.actualizar = async (req, res) => {
  const {
    nombre, ambito, tipo, inicio, fin, duracion, resolucion,
    resultados, otros,
    practicas, investigaciones, proyeccion, capacitacion, laboral, pasantia, movilidad,
  } = req.body;

  if (!nombre || !inicio || !fin || !ambito) {
    return res.status(400).json({ error: 'Campos requeridos: nombre, ambito, inicio, fin' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE convenios SET
        nombre=$1, ambito=$2, tipo=$3, inicio=$4, fin=$5,
        duracion=$6, resolucion=$7, resultados=$8, otros=$9,
        practicas=$10, investigaciones=$11, proyeccion=$12, capacitacion=$13,
        laboral=$14, pasantia=$15, movilidad=$16,
        actualizado_en=NOW()
       WHERE id=$17
       RETURNING *`,
      [
        nombre, ambito, tipo || null, inicio, fin,
        duracion || null, resolucion || null, resultados || null, otros || null,
        !!practicas, !!investigaciones, !!proyeccion, !!capacitacion,
        !!laboral, !!pasantia, !!movilidad,
        req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Convenio no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar convenio:', err);
    res.status(500).json({ error: 'Error al actualizar convenio' });
  }
};

// ─── seccion eliminar /api/convenios/:id ───────────────────────────────
exports.eliminar = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM convenios WHERE id = $1',
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Convenio no encontrado' });
    res.json({ mensaje: 'Convenio eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar convenio:', err);
    res.status(500).json({ error: 'Error al eliminar convenio' });
  }
};
