const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


//-------PRUEBA-------------
function normalizarNombre(nombre) {
  return nombre
    .toUpperCase()
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── CONFIGURACION MULTER ────────────────────────
const UPLOAD_DIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
  const nombreLimpio = file.originalname.replace(/\s+/g, "_");
  const unique = Math.floor(Math.random() * 100000);
  cb(null, `${unique}-${nombreLimpio}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Tipo de archivo no permitido"), false);
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});


// ─── LISTAR ─────────────────────────────────────
exports.listar = async (req, res) => {
  const {
    semestre,
    escuela,
    busqueda,
    es_internacional, // <-- NUEVO: Capturar el parámetro de filtro
  } = req.query;

  let query = "SELECT * FROM movilidades WHERE 1=1";
  const params = [];

  if (semestre && semestre !== "todos") {
    params.push(semestre);
    query += ` AND semestre = $${params.length}`;
  }

  if (escuela && escuela !== "todos") {
    params.push(escuela);
    query += ` AND escuela = $${params.length}`;
  }

  // <-- NUEVO: Filtrar por tipo nacional/internacional
  if (es_internacional && es_internacional !== "todos") {
    params.push(es_internacional === "true");
    query += ` AND es_internacional = $${params.length}`;
  }

  if (busqueda) {
    params.push(`%${busqueda}%`);
    query += `
      AND (
        nombres ILIKE $${params.length}
        OR universidadorigen ILIKE $${params.length}
        OR universidaddestino ILIKE $${params.length}
      )
    `;
  }

  query += " ORDER BY id DESC";

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error al listar movilidades:", err);
    res.status(500).json({ error: "Error al obtener movilidades" });
  }
};


// ─── OBTENER ────────────────────────────────────
exports.obtener = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM movilidades WHERE id = $1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Movilidad no encontrada",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener movilidad:", err);
    res.status(500).json({ error: "Error al obtener movilidad" });
  }
};


// ─── CREAR ──────────────────────────────────────
exports.crear = async (req, res) => {
  const {
    nombres,
    semestre,
    celular,
    escuela,
    periodo,
    universidadorigen,
    ciudadorigen,
    universidaddestino,
    ciudaddestino,
    apoyoeconomico,
    beca,
    tipobeca,
    estado,
    numeroexpediente,
    numeroresolucion,
    numerosiaf,
    observacion,
    es_internacional, // <-- NUEVO
  } = req.body;

  if (!nombres || !semestre) {
    return res.status(400).json({
      error: "Campos requeridos: nombres y semestre",
    });
  }
  const nombreNormalizado = normalizarNombre(nombres);

  try {
    // Contar movilidades previas del mismo alumno
    const { rows: previas } = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM movilidades
      WHERE UPPER(REPLACE(nombres, ',', '')) = $1
      `,
      [nombreNormalizado]
    );

    const numIntercambio = Number(previas[0].total) + 1;
    // Archivos adjuntos (opcionales)
    const archivo1 = req.files?.documento1?.[0] || null;
    const archivo2 = req.files?.documento2?.[0] || null;
    const documento_nombre = archivo1 ? archivo1.originalname : null;
    const documento_ruta   = archivo1 ? archivo1.filename : null;
    const documento2_nombre = archivo2 ? archivo2.originalname : null;
    const documento2_ruta   = archivo2 ? archivo2.filename : null;

    const { rows } = await pool.query(
      `
      INSERT INTO movilidades (
        nombres,
        semestre,
        celular,
        escuela,
        periodo,
        universidadorigen,
        ciudadorigen,
        universidaddestino,
        ciudaddestino,
        apoyoeconomico,
        beca,
        tipobeca,
        estado,
        intercambio,
        numeroexpediente,
        numeroresolucion,
        numerosiaf,
        observacion,
        documento_nombre,
        documento_ruta,
        documento2_nombre,
        documento2_ruta,
        es_internacional -- <-- NUEVA COLUMNA (Parámetro $23)
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
      )
      RETURNING *
      `,
      [
        nombres,
        semestre,
        celular || null,
        escuela || null,
        periodo || null,
        universidadorigen || null,
        ciudadorigen || null,
        universidaddestino || null,
        ciudaddestino || null,
        apoyoeconomico || null,
        beca || "no",
        tipobeca || null,
        estado || "activo",
        numIntercambio,
        numeroexpediente || null,
        numeroresolucion || null,
        numerosiaf || null,
        observacion || null,
        documento_nombre,
        documento_ruta,
        documento2_nombre,
        documento2_ruta,
        es_internacional === "true" || es_internacional === true, // <-- NUEVO: Convierte el valor a booleano
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error al crear movilidad:", err);
    res.status(500).json({ error: "Error al crear movilidad" });
  }
};


// ─── ACTUALIZAR ─────────────────────────────────
exports.actualizar = async (req, res) => {
  const {
    nombres,
    semestre,
    celular,
    escuela,
    periodo,
    universidadorigen,
    ciudadorigen,
    universidaddestino,
    ciudaddestino,
    apoyoeconomico,
    beca,
    tipobeca,
    estado,
    numeroexpediente,
    numeroresolucion,
    numerosiaf,
    observacion,
    intercambio,
    borrar_documento,
    borrar_documento2,
    es_internacional, // <-- NUEVO
  } = req.body;

  if (!nombres || !semestre) {
    return res.status(400).json({
      error: "Campos requeridos: nombres y semestre",
    });
  }

  try {
    const archivo1 = req.files?.documento1?.[0] || null;
    const archivo2 = req.files?.documento2?.[0] || null;
    const borrarDocumento1 = borrar_documento === "true" || borrar_documento === true;
    const borrarDocumento2 = borrar_documento2 === "true" || borrar_documento2 === true;

    const { rows: prevRows } = await pool.query(
      `SELECT documento_nombre, documento_ruta, documento2_nombre, documento2_ruta FROM movilidades WHERE id = $1`,
      [req.params.id]
    );

    if (!prevRows.length) {
      return res.status(404).json({ error: "Movilidad no encontrada" });
    }

    const prev = prevRows[0];

    let documento_nombre = prev.documento_nombre;
    let documento_ruta = prev.documento_ruta;
    let documento2_nombre = prev.documento2_nombre;
    let documento2_ruta = prev.documento2_ruta;

    if (archivo1) {
      if (prev.documento_ruta) {
        const oldPath = path.join(UPLOAD_DIR, prev.documento_ruta);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      documento_nombre = archivo1.originalname;
      documento_ruta = archivo1.filename;
    } else if (borrarDocumento1) {
      if (prev.documento_ruta) {
        const oldPath = path.join(UPLOAD_DIR, prev.documento_ruta);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      documento_nombre = null;
      documento_ruta = null;
    }

    if (archivo2) {
      if (prev.documento2_ruta) {
        const oldPath = path.join(UPLOAD_DIR, prev.documento2_ruta);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      documento2_nombre = archivo2.originalname;
      documento2_ruta = archivo2.filename;
    } else if (borrarDocumento2) {
      if (prev.documento2_ruta) {
        const oldPath = path.join(UPLOAD_DIR, prev.documento2_ruta);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      documento2_nombre = null;
      documento2_ruta = null;
    }

    const query = `
      UPDATE movilidades
      SET
        nombres = $1, semestre = $2, celular = $3, escuela = $4,
        periodo = $5, universidadorigen = $6, ciudadorigen = $7,
        universidaddestino = $8, ciudaddestino = $9, apoyoeconomico = $10,
        beca = $11, tipobeca = $12, estado = $13, intercambio = $14,
        numeroexpediente = $15, numeroresolucion = $16, numerosiaf = $17,
        observacion = $18, documento_nombre = $19, documento_ruta = $20,
        documento2_nombre = $21, documento2_ruta = $22,
        es_internacional = $23 -- <-- NUEVO (Parámetro $23)
      WHERE id = $24 -- <-- Cambia a $24
      RETURNING *
    `;

    const values = [
      nombres, semestre, celular || null, escuela || null,
      periodo || null, universidadorigen || null, ciudadorigen || null,
      universidaddestino || null, ciudaddestino || null, apoyoeconomico || null,
      beca || "no", tipobeca || null, estado || "activo",
      intercambio || "1", numeroexpediente || null, numeroresolucion || null, numerosiaf || null,
      observacion || null, documento_nombre, documento_ruta,
      documento2_nombre, documento2_ruta,
      es_internacional === "true" || es_internacional === true, // <-- NUEVO
      req.params.id,
    ];

    const { rows } = await pool.query(query, values);

    if (!rows.length) {
      return res.status(404).json({
        error: "Movilidad no encontrada",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error al actualizar movilidad:", err);
    res.status(500).json({ error: "Error al actualizar movilidad" });
  }
};


// ─── ELIMINAR ───────────────────────────────────
exports.eliminar = async (req, res) => {
  try {
    // Borrar archivo adjunto si existe
    const { rows } = await pool.query(
      `SELECT documento_ruta FROM movilidades WHERE id = $1`,
      [req.params.id]
    );
    if (rows[0]?.documento_ruta) {
      const filePath = path.join(UPLOAD_DIR, rows[0].documento_ruta);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const { rowCount } = await pool.query(
      `DELETE FROM movilidades WHERE id = $1`,
      [req.params.id]
    );

    if (!rowCount) {
      return res.status(404).json({
        error: "Movilidad no encontrada",
      });
    }

    res.json({
      mensaje: "Movilidad eliminada correctamente",
    });
  } catch (err) {
    console.error("Error al eliminar movilidad:", err);
    res.status(500).json({ error: "Error al eliminar movilidad" });
  }
};


// ─── DESCARGAR DOCUMENTO ────────────────────────
exports.descargarDocumento = async (req, res) => {
  try {
    const indice = Number(req.query.indice || 1);
    if (![1, 2].includes(indice)) {
      return res.status(400).json({ error: "Índice de documento inválido" });
    }

    const columnas = indice === 1
      ? "documento_nombre, documento_ruta"
      : "documento2_nombre AS documento_nombre, documento2_ruta AS documento_ruta";

    const { rows } = await pool.query(
      `SELECT ${columnas} FROM movilidades WHERE id = $1`,
      [req.params.id]
    );

    if (!rows.length || !rows[0].documento_ruta) {
      return res.status(404).json({ error: "No hay documento adjunto" });
    }

    const filePath = path.join(UPLOAD_DIR, rows[0].documento_ruta);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado en el servidor" });
    }

    res.download(filePath, rows[0].documento_nombre);
  } catch (err) {
    console.error("Error al descargar documento:", err);
    res.status(500).json({ error: "Error al descargar documento" });
  }
};