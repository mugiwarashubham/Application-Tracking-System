const mongoose = require('mongoose');

const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
const SOURCES = ['LinkedIn', 'Referral', 'Job board', 'Company site', 'Agency', 'Other'];

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    phone: { type: String, trim: true },
    position: { type: String, required: [true, 'Position is required'], trim: true },
    skills: [{ type: String, trim: true }],
    experience: { type: Number, min: [0, 'Experience cannot be negative'], default: 0 },
    source: { type: String, enum: SOURCES, default: 'Other' },
    stage: { type: String, enum: STAGES, default: 'Applied' },
    notes: { type: String, trim: true },
    stageHistory: [
      {
        stage: { type: String, enum: STAGES },
        changedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    hiredAt: Date,
  },
  { timestamps: true }
);

candidateSchema.index({ stage: 1 });
candidateSchema.index({ position: 1 });

// Single place where stage changes happen, so history and hiredAt stay consistent
candidateSchema.methods.setStage = function (stage) {
  if (stage === this.stage) return;
  this.stage = stage;
  this.stageHistory.push({ stage, changedAt: new Date() });
  this.hiredAt = stage === 'Hired' ? new Date() : undefined;
};

module.exports = { Candidate: mongoose.model('Candidate', candidateSchema), STAGES, SOURCES };
