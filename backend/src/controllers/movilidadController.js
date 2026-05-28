const pool = require("../config/db");


// ─── LISTAR ─────────────────────────────────────
exports.listar = async (req, res) => {

  const {
    semestre,
    escuela,
    busqueda,
  } = req.query;

  let query =
    "SELECT * FROM movilidades WHERE 1=1";

  const params = [];

  // Filtrar por semestre
  if (
    semestre &&
    semestre !== "todos"
  ) {

    params.push(semestre);

    query += `
      AND semestre = $${params.length}
    `;
  }

  // Filtrar por escuela
  if (
    escuela &&
    escuela !== "todos"
  ) {

    params.push(escuela);

    query += `
      AND escuela = $${params.length}
    `;
  }

  // Busqueda
  if (busqueda) {

    params.push(`%${busqueda}%`);

    query += `
      AND (
        nombres ILIKE $${params.length}
        OR universidad_origen ILIKE $${params.length}
        OR universidad_destino ILIKE $${params.length}
      )
    `;
  }

  query += `
    ORDER BY id DESC
  `;

  try {

    const { rows } =
      await pool.query(query, params);

    res.json(rows);

  } catch (err) {

    console.error(
      "Error al listar movilidades:",
      err
    );

    res.status(500).json({
      error: "Error al obtener movilidades",
    });
  }
};


// ─── OBTENER ────────────────────────────────────
exports.obtener = async (req, res) => {

  try {

    const { rows } = await pool.query(
      `
      SELECT *
      FROM movilidades
      WHERE id = $1
      `,
      [req.params.id]
    );

    if (!rows.length) {

      return res.status(404).json({
        error: "Movilidad no encontrada",
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error(
      "Error al obtener movilidad:",
      err
    );

    res.status(500).json({
      error: "Error al obtener movilidad",
    });
  }
};


// ─── CREAR ──────────────────────────────────────
exports.crear = async (req, res) => {

  const {
    nombres,
    semestre,
    celular,
    escuela,
    universidadorigen,
    ciudadorigen,
    universidaddestino,
    ciudaddestino,
    apoyoeconomico,
  } = req.body;

  // Validaciones
  if (!nombres || !semestre) {

    return res.status(400).json({
      error:
        "Campos requeridos: nombres y semestre",
    });
  }

  try {

    const { rows } = await pool.query(
      `
      INSERT INTO movilidades (
        nombres,
        semestre,
        celular,
        escuela,
        universidadorigen,
        ciudadorigen,
        universidaddestino,
        ciudaddestino,
        apoyoeconomico
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )
      RETURNING *
      `,
      [
        nombres,
        semestre,
        celular || null,
        escuela || null,
        universidadorigen || null,
        ciudadorigen || null,
        universidaddestino || null,
        ciudaddestino || null,
        apoyoeconomico || null,
      ]
    );

    res.status(201).json(rows[0]);

  } catch (err) {

    console.error(
      "Error al crear movilidad:",
      err
    );

    res.status(500).json({
      error: "Error al crear movilidad",
    });
  }
};


// ─── ACTUALIZAR ─────────────────────────────────
exports.actualizar = async (req, res) => {

  const {
    nombres,
    semestre,
    celular,
    escuela,
    universidadorigen,
    ciudadorigen,
    universidaddestino,
    ciudaddestino,
    apoyoeconomico,
  } = req.body;

  if (!nombres || !semestre) {

    return res.status(400).json({
      error:
        "Campos requeridos: nombres y semestre",
    });
  }

  try {

    const { rows } = await pool.query(
      `
      UPDATE movilidades
      SET
        nombres = $1,
        semestre = $2,
        celular = $3,
        escuela = $4,
        universidadorigen = $5,
        ciudadorigen = $6,
        universidaddestino = $7,
        ciudaddestino = $8,
        apoyoeconomico = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        nombres,
        semestre,
        celular || null,
        escuela || null,
        universidadorigen || null,
        ciudadorigen || null,
        universidaddestino || null,
        ciudaddestino || null,
        apoyoeconomico || null,
        req.params.id,
      ]
    );

    if (!rows.length) {

      return res.status(404).json({
        error: "Movilidad no encontrada",
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error(
      "Error al actualizar movilidad:",
      err
    );

    res.status(500).json({
      error: "Error al actualizar movilidad",
    });
  }
};


// ─── ELIMINAR ───────────────────────────────────
exports.eliminar = async (req, res) => {

  try {

    const { rowCount } =
      await pool.query(
        `
        DELETE FROM movilidades
        WHERE id = $1
        `,
        [req.params.id]
      );

    if (!rowCount) {

      return res.status(404).json({
        error: "Movilidad no encontrada",
      });
    }

    res.json({
      mensaje:
        "Movilidad eliminada correctamente",
    });

  } catch (err) {

    console.error(
      "Error al eliminar movilidad:",
      err
    );

    res.status(500).json({
      error: "Error al eliminar movilidad",
    });
  }
};