const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validateObjectId');
const { createCrudHandlers } = require('../controllers/crudController');

// Mounts GET (public), POST, PUT/:id, DELETE/:id (admin only) for one collection.
function makeCrudRouter(options) {
  const router = express.Router();
  const h = createCrudHandlers(options);
  router.get('/', h.list);
  router.post('/', requireAdmin, h.create);
  router.put('/:id', requireAdmin, validateObjectId, h.update);
  router.delete('/:id', requireAdmin, validateObjectId, h.remove);
  return router;
}

module.exports = { makeCrudRouter };
