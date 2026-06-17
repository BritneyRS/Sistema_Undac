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
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});


// ─── LISTAR ─────────────────────────────────────
exports.listar = async (req, res) => {

  const {
    semestre,
    escuela,
    busqueda,
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
    // Archivo adjunto (opcional)
    const documento_nombre = req.file ? req.file.originalname : null;
    const documento_ruta   = req.file ? req.file.filename : null;

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
        documento_ruta
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
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
  } = req.body;

  if (!nombres || !semestre) {
    return res.status(400).json({
      error: "Campos requeridos: nombres y semestre",
    });
  }

  try {

    // Si viene nuevo archivo, obtener el anterior para borrarlo
    let documento_nombre = null;
    let documento_ruta   = null;
    let borrarDocumento  = false;

    if (req.file) {
      documento_nombre = req.file.originalname;
      documento_ruta   = req.file.filename;

      // Borrar archivo anterior si existe
      const { rows: prev } = await pool.query(
        `SELECT documento_ruta FROM movilidades WHERE id = $1`,
        [req.params.id]
      );
      if (prev[0]?.documento_ruta) {
        const oldPath = path.join(UPLOAD_DIR, prev[0].documento_ruta);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    } else if (borrar_documento === "true" || borrar_documento === true) {
      borrarDocumento = true;
      const { rows: prev } = await pool.query(
        `SELECT documento_ruta FROM movilidades WHERE id = $1`,
        [req.params.id]
      );
      if (prev[0]?.documento_ruta) {
        const oldPath = path.join(UPLOAD_DIR, prev[0].documento_ruta);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    // Construir query dinámicamente según si hay nuevo archivo o se borra el archivo
    let query, values;

    if (req.file) {
      query = `
        UPDATE movilidades
        SET
          nombres = $1, semestre = $2, celular = $3, escuela = $4,
          periodo = $5, universidadorigen = $6, ciudadorigen = $7,
          universidaddestino = $8, ciudaddestino = $9, apoyoeconomico = $10,
          beca = $11, tipobeca = $12, estado = $13, intercambio = $14,
          numeroexpediente = $15, numeroresolucion = $16, numerosiaf = $17,
          observacion = $18, documento_nombre = $19, documento_ruta = $20
        WHERE id = $21
        RETURNING *
      `;
      values = [
        nombres, semestre, celular || null, escuela || null,
        periodo || null, universidadorigen || null, ciudadorigen || null,
        universidaddestino || null, ciudaddestino || null, apoyoeconomico || null,
        beca || "no", tipobeca || null, estado || "activo",
        intercambio || "primera", numeroexpediente || null, numeroresolucion || null, numerosiaf || null,
        observacion || null, documento_nombre, documento_ruta,
        req.params.id,
      ];
    } else if (borrarDocumento) {
      query = `
        UPDATE movilidades
        SET
          nombres = $1, semestre = $2, celular = $3, escuela = $4,
          periodo = $5, universidadorigen = $6, ciudadorigen = $7,
          universidaddestino = $8, ciudaddestino = $9, apoyoeconomico = $10,
          beca = $11, tipobeca = $12, estado = $13, intercambio = $14,
          numeroexpediente = $15, numeroresolucion = $16, numerosiaf = $17,
          observacion = $18, documento_nombre = NULL, documento_ruta = NULL
        WHERE id = $19
        RETURNING *
      `;
      values = [
        nombres, semestre, celular || null, escuela || null,
        periodo || null, universidadorigen || null, ciudadorigen || null,
        universidaddestino || null, ciudaddestino || null, apoyoeconomico || null,
        beca || "no", tipobeca || null, estado || "activo",
        intercambio || "primera", numeroexpediente || null, numeroresolucion || null, numerosiaf || null,
        observacion || null,
        req.params.id,
      ];
    } else {
      query = `
        UPDATE movilidades
        SET
          nombres = $1, semestre = $2, celular = $3, escuela = $4,
          periodo = $5, universidadorigen = $6, ciudadorigen = $7,
          universidaddestino = $8, ciudaddestino = $9, apoyoeconomico = $10,
          beca = $11, tipobeca = $12, estado = $13, intercambio = $14,
          numeroexpediente = $15, numeroresolucion = $16, numerosiaf = $17,
          observacion = $18
        WHERE id = $19
        RETURNING *
      `;
      values = [
        nombres, semestre, celular || null, escuela || null,
        periodo || null, universidadorigen || null, ciudadorigen || null,
        universidaddestino || null, ciudaddestino || null, apoyoeconomico || null,
        beca || "no", tipobeca || null, estado || "activo",
        intercambio || "1", numeroexpediente || null, numeroresolucion || null, numerosiaf || null,
        observacion || null,
        req.params.id,
      ];
    }

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

    const { rows } = await pool.query(
      `SELECT documento_nombre, documento_ruta FROM movilidades WHERE id = $1`,
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