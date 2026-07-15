const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const { createCloudinaryStorage, deleteFromCloudinaryByUrl } = require('../config/cloudinary');

function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'TRUE' || value === 'si' || value === 'sí' || value === 'Si' || value === 'Sí';
}

const fileFilter = (_req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Tipo de archivo no permitido'), false);
};

exports.upload = multer({
  storage: createCloudinaryStorage('convenios'),
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

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

  query += ` ORDER BY
    CASE
      WHEN fin < CURRENT_DATE THEN 3
      WHEN fin <= CURRENT_DATE + INTERVAL '60 days' THEN 1
      ELSE 2
    END ASC,
    fin ASC`;

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
    const archivo = req.file || null;
    const documento_nombre = archivo ? archivo.originalname : null;
    const documento_ruta = archivo ? archivo.path : null;
    const practicasValue = toBoolean(practicas);
    const investigacionesValue = toBoolean(investigaciones);
    const proyeccionValue = toBoolean(proyeccion);
    const capacitacionValue = toBoolean(capacitacion);
    const laboralValue = toBoolean(laboral);
    const pasantiaValue = toBoolean(pasantia);
    const movilidadValue = toBoolean(movilidad);

    /*const documento_base64 = archivo
    ? convertirABase64(archivo.path)
    : null;*/

    const { rows } = await pool.query(
      `INSERT INTO convenios
        (nombre, ambito, tipo, inicio, fin, duracion, resolucion, resultados, otros,
         practicas, investigaciones, proyeccion, capacitacion, laboral, pasantia, movilidad,
         documento_nombre, documento_ruta, creado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [
        nombre, ambito, tipo || null, inicio, fin,
        duracion || null, resolucion || null, resultados || null, otros || null,
        practicasValue, investigacionesValue, proyeccionValue, capacitacionValue,
        laboralValue, pasantiaValue, movilidadValue,
        documento_nombre, documento_ruta,
        req.usuario.id,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error al crear convenio:', err);
    res.status(500).json({ error: 'Error al crear convenio', details: err.message });
  }
};


// ─── seccion actualizar /api/convenios/:id ──────────────────────────────────
exports.actualizar = async (req, res) => {
  const {
    nombre, ambito, tipo, inicio, fin, duracion, resolucion,
    resultados, otros,
    practicas, investigaciones, proyeccion, capacitacion, laboral, pasantia, movilidad,
    borrar_documento,
  } = req.body;

  if (!nombre || !inicio || !fin || !ambito) {
    return res.status(400).json({ error: 'Campos requeridos: nombre, ambito, inicio, fin' });
  }

  try {
    const archivo = req.file || null;
    const borrarDocumento = borrar_documento === 'true' || borrar_documento === true;

    const { rows: prevRows } = await pool.query(
      'SELECT documento_nombre, documento_ruta FROM convenios WHERE id = $1',
      [req.params.id]
    );

    if (!prevRows.length) return res.status(404).json({ error: 'Convenio no encontrado' });

    const prev = prevRows[0];
    let documento_nombre = prev.documento_nombre;
    let documento_ruta = prev.documento_ruta;
    /*let documento_base64 = prev.documento_base64;*/

    if (archivo) {
      if (prev.documento_ruta) {
        await deleteFromCloudinaryByUrl(prev.documento_ruta);
      }
      documento_nombre = archivo.originalname;
      documento_ruta = archivo.path;
    } else if (borrarDocumento) {
      if (prev.documento_ruta) {
        await deleteFromCloudinaryByUrl(prev.documento_ruta);
      }
      documento_nombre = null;
      documento_ruta = null;
    }

    const practicasValue = toBoolean(practicas);
    const investigacionesValue = toBoolean(investigaciones);
    const proyeccionValue = toBoolean(proyeccion);
    const capacitacionValue = toBoolean(capacitacion);
    const laboralValue = toBoolean(laboral);
    const pasantiaValue = toBoolean(pasantia);
    const movilidadValue = toBoolean(movilidad);

    const { rows } = await pool.query(
      `UPDATE convenios SET
        nombre=$1, ambito=$2, tipo=$3, inicio=$4, fin=$5,
        duracion=$6, resolucion=$7, resultados=$8, otros=$9,
        practicas=$10, investigaciones=$11, proyeccion=$12, capacitacion=$13,
        laboral=$14, pasantia=$15, movilidad=$16,
        documento_nombre=$17, documento_ruta=$18,
        actualizado_en=NOW()
       WHERE id=$19
       RETURNING *`,
      [
        nombre, ambito, tipo || null, inicio, fin,
        duracion || null, resolucion || null, resultados || null, otros || null,
        practicasValue, investigacionesValue, proyeccionValue, capacitacionValue,
        laboralValue, pasantiaValue, movilidadValue,
        documento_nombre, documento_ruta,
        req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Convenio no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar convenio:', err);
    res.status(500).json({ error: 'Error al actualizar convenio', details: err.message });
  }
};

// ─── seccion eliminar /api/convenios/:id ───────────────────────────────
exports.eliminar = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT documento_ruta FROM convenios WHERE id = $1',
      [req.params.id]
    );

    if (rows[0]?.documento_ruta) {
      await deleteFromCloudinaryByUrl(rows[0].documento_ruta);
    }

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

exports.descargarDocumento = async (req, res) => {
  try {
    const preview = req.query.preview === 'true' || req.query.preview === '1';

    const { rows } = await pool.query(
      'SELECT documento_nombre, documento_ruta FROM convenios WHERE id = $1',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Convenio no encontrado' });
    }

    const documento = rows[0];

    if (documento.documento_ruta && /^https?:\/\//i.test(documento.documento_ruta)) {
      try {
        const response = await fetch(documento.documento_ruta);
        if (!response.ok) {
          throw new Error(`Error al obtener de Cloudinary: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType) {
          res.setHeader('Content-Type', contentType);
        }

        const encodedName = encodeURIComponent(documento.documento_nombre || 'documento');
        if (preview) {
          res.setHeader('Content-Disposition', `inline; filename="${encodedName}"; filename*=UTF-8''${encodedName}`);
        } else {
          res.setHeader('Content-Disposition', `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return res.send(buffer);
      } catch (cloudinaryErr) {
        console.error('Error al descargar desde Cloudinary:', cloudinaryErr);
        return res.status(500).json({ error: 'Error al recuperar el archivo desde Cloudinary' });
      }
    }

    if (documento.documento_ruta) {
      const filePath = documento.documento_ruta;

      if (preview) {
        return res.sendFile(filePath, {
          headers: {
            'Content-Disposition': `inline; filename="${documento.documento_nombre || 'documento'}"`,
          },
        });
      }

      return res.download(filePath, documento.documento_nombre || 'documento');
    }

    return res.status(404).json({
      error: 'No hay documento adjunto'
    });

  } catch (err) {
    console.error('Error al descargar documento:', err);
    res.status(500).json({
      error: 'Error al descargar documento'
    });
  }
};