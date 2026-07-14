const router = require('express').Router();
const ctrl   = require('../controllers/movilidadController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

function manejarUploadFields(req, res, next) {
  ctrl.upload.fields([
    { name: 'documento1', maxCount: 1 },
    { name: 'documento2', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error al subir los archivos', details: err.message });
    }
    next();
  });
}

router.use(verificarToken);

router.get('/',      ctrl.listar);
router.get('/:id',   ctrl.obtener);

// Crear y actualizar usan multer para aceptar archivos (campos "documento1" y "documento2")
router.post('/',     soloAdmin, manejarUploadFields, ctrl.crear);
router.put('/:id',   soloAdmin, manejarUploadFields, ctrl.actualizar);
router.delete('/:id',soloAdmin, ctrl.eliminar);

// Descarga del documento adjunto
router.get('/:id/documento', ctrl.descargarDocumento);


module.exports = router;