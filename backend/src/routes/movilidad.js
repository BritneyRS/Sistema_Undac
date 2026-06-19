const router = require('express').Router();
const ctrl   = require('../controllers/movilidadController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.use(verificarToken);

router.get('/',      ctrl.listar);
router.get('/:id',   ctrl.obtener);

// Crear y actualizar usan multer para aceptar archivos (campos "documento1" y "documento2")
const uploadFields = ctrl.upload.fields([
  { name: 'documento1', maxCount: 1 },
  { name: 'documento2', maxCount: 1 },
]);
router.post('/',     soloAdmin, uploadFields, ctrl.crear);
router.put('/:id',   soloAdmin, uploadFields, ctrl.actualizar);
router.delete('/:id',soloAdmin, ctrl.eliminar);

// Descarga del documento adjunto
router.get('/:id/documento', ctrl.descargarDocumento);


module.exports = router;