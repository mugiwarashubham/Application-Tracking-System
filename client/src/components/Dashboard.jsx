import { useEffect, useState } from 'react';
import { api } from '../api';
import { STAGES, STAGE_COLORS } from '../constants';

function Bars({ items, color = 'var(--accent)' }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="barlist">
      {items.map((i) => (
        <li key={i.name}>
          <span className="barlabel">{i.name}</span>
          <span className="bartrack"><span style={{ width: `${(i.count / max) * 100}%`, background: color }} /></span>
          <span className="barval">{i.count}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard({ refreshKey }) {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboard().then(setD).catch((e) => setError(e.message));
  }, [refreshKey]);

  if (error) return <p className="empty">Could not load metrics: {error}</p>;
  if (!d) return <p className="empty">Loading metrics…</p>;
  if (d.total === 0) return <p className="empty">No candidates yet. Add your first candidate to see hiring metrics.</p>;

  const weeklyMax = Math.max(1, ...d.weekly.map((w) => w.count));
  const applied = d.funnel[0].count || 1;

  const figures = [
    { label: 'Total candidates', value: d.total },
    { label: 'Active in pipeline', value: d.active },
    { label: 'Hired', value: d.hired, note: `${d.hireRate}% of all candidates` },
    { label: 'Avg. days to hire', value: d.avgDaysToHire ?? '—' },
  ];

  return (
    <div className="dash">
      <section className="figures">
        {figures.map((f) => (
          <div key={f.label} className="figure">
            <div className="fig-value">{f.value}</div>
            <div className="fig-label">{f.label}</div>
            {f.note && <div className="fig-note">{f.note}</div>}
          </div>
        ))}
      </section>

      <section className="panel wide">
        <h2>Hiring funnel</h2>
        <p className="hint">Candidates who reached each stage at any point.</p>
        <ul className="funnel">
          {d.funnel.map((f) => (
            <li key={f.stage}>
              <span className="barlabel">{f.stage}</span>
              <span className="funnel-track">
                <span style={{ width: `${(f.count / applied) * 100}%`, background: STAGE_COLORS[f.stage] }} />
              </span>
              <span className="barval">{f.count}</span>
              <span className="pct">{Math.round((f.count / applied) * 100)}%</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Right now</h2>
        <ul className="stagecounts">
          {STAGES.map((s) => (
            <li key={s}>
              <span className="dot" style={{ background: STAGE_COLORS[s] }} />
              <span>{s}</span>
              <strong>{d.byStage[s]}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Applications per week</h2>
        <div className="columns" role="img" aria-label="Applications per week, last 8 weeks">
          {d.weekly.map((w) => (
            <div key={w.label} className="col">
              <span className="colval">{w.count}</span>
              <span className="colbar" style={{ height: `${(w.count / weeklyMax) * 100}%` }} />
              <span className="collabel">{w.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Where candidates come from</h2>
        <Bars items={d.bySource} />
      </section>

      <section className="panel">
        <h2>Busiest roles</h2>
        <Bars items={d.topPositions} color="var(--ink)" />
      </section>
    </div>
  );
}
