const { readAdmin } = require('../middleware/auth');

// Builds the list, create, update, and delete handlers for a collection.
// Public reads return only published items. Admins can request everything with ?all=true.
function createCrudHandlers({ Model, sanitize, sort }) {
  return {
    list: async (req, res, next) => {
      try {
        const includeAll = req.query.all === 'true' && Boolean(readAdmin(req));
        const items = await Model.find(includeAll ? {} : { published: true }).sort(sort).lean();
        res.json(items);
      } catch (err) {
        next(err);
      }
    },

    create: async (req, res, next) => {
      try {
        const result = sanitize(req.body);
        if (result.error) return res.status(400).json({ message: result.error });
        const doc = await Model.create(result.value);
        res.status(201).json(doc);
      } catch (err) {
        next(err);
      }
    },

    update: async (req, res, next) => {
      try {
        const result = sanitize(req.body);
        if (result.error) return res.status(400).json({ message: result.error });
        const doc = await Model.findByIdAndUpdate(req.params.id, result.value, {
          new: true,
          runValidators: true,
        }).lean();
        if (!doc) return res.status(404).json({ message: 'Record not found' });
        res.json(doc);
      } catch (err) {
        next(err);
      }
    },

    remove: async (req, res, next) => {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id).lean();
        if (!doc) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'Deleted' });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { createCrudHandlers };
