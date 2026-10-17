const router = require('express').Router();
const { Candidate, STAGES } = require('../models/Candidate');

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const DAY = 86400000;
const FUNNEL = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
const WEEKS = 8;

// GET /api/dashboard
router.get('/', wrap(async (req, res) => {
  const now = Date.now();
  const since = new Date(now - WEEKS * 7 * DAY);

  const [total, stageAgg, sourceAgg, positionAgg, hireAgg, recent, ...reached] = await Promise.all([
    Candidate.countDocuments(),
    Candidate.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
    Candidate.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Candidate.aggregate([{ $group: { _id: '$position', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    Candidate.aggregate([
      { $match: { hiredAt: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: { $divide: [{ $subtract: ['$hiredAt', '$createdAt'] }, DAY] } } } },
    ]),
    Candidate.find({ createdAt: { $gte: since } }).select('createdAt'),
    // funnel: how many candidates ever reached each stage
    ...FUNNEL.map((s) => Candidate.countDocuments({ 'stageHistory.stage': s })),
  ]);

  const byStage = Object.fromEntries(STAGES.map((s) => [s, 0]));
  stageAgg.forEach((r) => (byStage[r._id] = r.count));

  // Applications per week, oldest -> newest
  const buckets = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(now - (WEEKS - i) * 7 * DAY);
    return { label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: 0 };
  });
  recent.forEach((c) => {
    const idx = WEEKS - 1 - Math.floor((now - c.createdAt.getTime()) / (7 * DAY));
    if (buckets[idx]) buckets[idx].count++;
  });

  res.json({
    total,
    active: total - byStage.Hired - byStage.Rejected,
    hired: byStage.Hired,
    rejected: byStage.Rejected,
    hireRate: total ? Math.round((byStage.Hired / total) * 1000) / 10 : 0,
    avgDaysToHire: hireAgg[0] ? Math.round(hireAgg[0].avg * 10) / 10 : null,
    byStage,
    funnel: FUNNEL.map((stage, i) => ({ stage, count: reached[i] })),
    bySource: sourceAgg.map((r) => ({ name: r._id, count: r.count })),
    topPositions: positionAgg.map((r) => ({ name: r._id, count: r.count })),
    weekly: buckets,
  });
}));

module.exports = router;
