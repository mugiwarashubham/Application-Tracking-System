require('dotenv').config();
const mongoose = require('mongoose');
const { Candidate, STAGES, SOURCES } = require('./models/Candidate');

const first = ['Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Neha', 'Kabir', 'Isha', 'Arjun', 'Meera', 'Sanjay', 'Divya', 'Rahul', 'Tanvi', 'Karan', 'Sneha', 'Aditya', 'Pooja', 'Nikhil', 'Riya'];
const last = ['Sharma', 'Verma', 'Gupta', 'Iyer', 'Singh', 'Patel', 'Nair', 'Reddy', 'Mehta', 'Kapoor'];
const roles = {
  'Frontend Developer': ['React', 'TypeScript', 'CSS', 'Redux'],
  'Backend Developer': ['Node.js', 'Express', 'MongoDB', 'REST'],
  'Full Stack Developer': ['React', 'Node.js', 'MongoDB', 'Docker'],
  'UI/UX Designer': ['Figma', 'Prototyping', 'Research'],
  'QA Engineer': ['Selenium', 'Jest', 'Cypress'],
  'Product Manager': ['Roadmapping', 'Analytics', 'Agile'],
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const DAY = 86400000;

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini-ats');
  await Candidate.deleteMany({});

  const docs = Array.from({ length: 30 }, (_, i) => {
    const fn = first[i % first.length];
    const ln = pick(last);
    const position = pick(Object.keys(roles));
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 55) * DAY);

    // Pick a final stage, then build a believable history up to it
    const final = STAGES[Math.floor(Math.random() * STAGES.length)];
    const path = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
    const reachedTo = final === 'Rejected' ? Math.floor(Math.random() * 3) : path.indexOf(final);
    const stages = path.slice(0, reachedTo + 1);
    if (final === 'Rejected') stages.push('Rejected');

    let t = createdAt.getTime();
    const stageHistory = stages.map((stage) => {
      const entry = { stage, changedAt: new Date(t) };
      t += Math.ceil(Math.random() * 6) * DAY;
      return entry;
    });
    const hiredAt = final === 'Hired' ? stageHistory[stageHistory.length - 1].changedAt : undefined;

    return {
      name: `${fn} ${ln}`,
      email: `${fn}.${ln}${i}@example.com`.toLowerCase(),
      phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
      position,
      skills: roles[position].slice(0, 2 + Math.floor(Math.random() * 2)),
      experience: Math.floor(Math.random() * 9),
      source: pick(SOURCES),
      stage: final,
      stageHistory,
      hiredAt,
      notes: '',
      createdAt,
    };
  });

  await Candidate.insertMany(docs);
  console.log(`Seeded ${docs.length} candidates`);
  await mongoose.disconnect();
})();
