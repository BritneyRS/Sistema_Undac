const router = require('express').Router();
const ctrl   = require('../controllers/movilidadController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.use(verificarToken);

router.get('/',      ctrl.listar);
router.get('/:id',   ctrl.obtener);

// Crear y actualizar usan multer para aceptar archivos (campo "documento")
router.post('/',     soloAdmin, ctrl.upload.single('documento'), ctrl.crear);
router.put('/:id',   soloAdmin, ctrl.upload.single('documento'), ctrl.actualizar);
router.delete('/:id',soloAdmin, ctrl.eliminar);

// Descarga del documento adjunto
router.get('/:id/documento', ctrl.descargarDocumento);

module.exports = router;