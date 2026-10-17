const router = require('express').Router();
const { Candidate, STAGES } = require('../models/Candidate');

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whitelist editable fields; skills may arrive as an array or "a, b, c"
const pickFields = (body) => {
  const out = {};
  ['name', 'email', 'phone', 'position', 'experience', 'source', 'notes'].forEach((k) => {
    if (body[k] !== undefined) out[k] = body[k];
  });
  if (body.skills !== undefined) {
    out.skills = Array.isArray(body.skills)
      ? body.skills
      : String(body.skills).split(',').map((s) => s.trim()).filter(Boolean);
  }
  return out;
};

// GET /api/candidates?q=&stage=&position=&source=&sort=&page=&limit=
router.get('/', wrap(async (req, res) => {
  const { q, stage, position, source, sort } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 20));

  const filter = {};
  if (STAGES.includes(stage)) filter.stage = stage;
  if (position) filter.position = position;
  if (source) filter.source = source;
  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { position: rx }, { skills: rx }];
  }

  const sortable = ['createdAt', '-createdAt', 'name', '-name', 'experience', '-experience'];
  const [data, total] = await Promise.all([
    Candidate.find(filter).sort(sortable.includes(sort) ? sort : '-createdAt').skip((page - 1) * limit).limit(limit),
    Candidate.countDocuments(filter),
  ]);
  res.json({ data, total, page, pages: Math.ceil(total / limit) });
}));

// GET /api/candidates/meta  -> values for filter dropdowns
router.get('/meta', wrap(async (req, res) => {
  const positions = await Candidate.distinct('position');
  res.json({ positions: positions.sort() });
}));

router.get('/:id', wrap(async (req, res) => {
  const c = await Candidate.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Candidate not found.' });
  res.json(c);
}));

router.post('/', wrap(async (req, res) => {
  const c = new Candidate(pickFields(req.body));
  c.stage = 'Applied';
  c.stageHistory = [{ stage: 'Applied' }];
  if (STAGES.includes(req.body.stage)) c.setStage(req.body.stage);
  await c.save();
  res.status(201).json(c);
}));

router.put('/:id', wrap(async (req, res) => {
  const c = await Candidate.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Candidate not found.' });
  c.set(pickFields(req.body));
  if (STAGES.includes(req.body.stage)) c.setStage(req.body.stage);
  await c.save();
  res.json(c);
}));

router.patch('/:id/stage', wrap(async (req, res) => {
  if (!STAGES.includes(req.body.stage)) return res.status(400).json({ message: 'Invalid stage.' });
  const c = await Candidate.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Candidate not found.' });
  c.setStage(req.body.stage);
  await c.save();
  res.json(c);
}));

router.delete('/:id', wrap(async (req, res) => {
  const c = await Candidate.findByIdAndDelete(req.params.id);
  if (!c) return res.status(404).json({ message: 'Candidate not found.' });
  res.json({ message: 'Candidate deleted.' });
}));

module.exports = router;
