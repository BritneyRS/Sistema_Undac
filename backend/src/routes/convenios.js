const router = require('express').Router();
const ctrl   = require('../controllers/conveniosController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// Todas las rutas requieren estar autenticado
router.use(verificarToken);

router.get('/',      ctrl.listar);
router.get('/:id',   ctrl.obtener);
router.get('/:id/documento', ctrl.descargarDocumento);
router.post('/',     soloAdmin, ctrl.upload.single('documento'), ctrl.crear);
router.put('/:id',   soloAdmin, ctrl.upload.single('documento'), ctrl.actualizar);
router.delete('/:id',soloAdmin, ctrl.eliminar);

module.exports = router;