const router = require('express').Router();
const ctrl   = require('../controllers/movilidadController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.use(verificarToken);

router.get('/',      ctrl.listar);
router.get('/:id',   ctrl.obtener);
router.post('/',     soloAdmin, ctrl.crear);
router.put('/:id',   soloAdmin, ctrl.actualizar);
router.delete('/:id',soloAdmin, ctrl.eliminar);

module.exports = router;
