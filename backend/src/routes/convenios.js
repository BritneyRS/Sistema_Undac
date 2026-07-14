const router = require('express').Router();
const ctrl   = require('../controllers/conveniosController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

function manejarUploadSimple(req, res, next) {
  ctrl.upload.single('documento')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error al subir el archivo', details: err.message });
    }
    next();
  });
}

// Todas las rutas requieren estar autenticado
router.use(verificarToken);

router.get('/',      ctrl.listar);
router.get('/:id',   ctrl.obtener);
router.get('/:id/documento', ctrl.descargarDocumento);
router.post('/',     soloAdmin, manejarUploadSimple, ctrl.crear);
router.put('/:id',   soloAdmin, manejarUploadSimple, ctrl.actualizar);
router.delete('/:id',soloAdmin, ctrl.eliminar);

module.exports = router;