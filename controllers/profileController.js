const Profile = require('../models/Profile');
const { profileSanitizer } = require('../utils/sanitize');

async function getProfile(req, res, next) {
  try {
    const profile = await Profile.findOneAndUpdate(
      { key: 'main' },
      { $setOnInsert: { key: 'main' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const result = profileSanitizer(req.body);
    if (result.error) return res.status(400).json({ message: result.error });

    const profile = await Profile.findOneAndUpdate({ key: 'main' }, result.value, {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }).lean();
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
