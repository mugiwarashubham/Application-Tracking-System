import { useState } from 'react';
import { STAGES, STAGE_COLORS, daysSince, initials } from '../constants';

export default function Board({ candidates, onMove, onOpen }) {
  const [over, setOver] = useState(null);

  const drop = (e, stage) => {
    e.preventDefault();
    setOver(null);
    const id = e.dataTransfer.getData('text/plain');
    const c = candidates.find((x) => x._id === id);
    if (c) onMove(c, stage);
  };

  return (
    <div className="board">
      {STAGES.map((stage) => {
        const items = candidates.filter((c) => c.stage === stage);
        return (
          <section
            key={stage}
            className={over === stage ? 'lane over' : 'lane'}
            onDragOver={(e) => { e.preventDefault(); setOver(stage); }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => drop(e, stage)}
          >
            <header className="lane-head" style={{ borderTopColor: STAGE_COLORS[stage] }}>
              <span>{stage}</span>
              <span className="lane-count">{items.length}</span>
            </header>
            <div className="lane-body">
              {items.length === 0 && <p className="lane-empty">Drop a candidate here</p>}
              {items.map((c) => {
                const last = c.stageHistory?.[c.stageHistory.length - 1];
                return (
                  <article
                    key={c._id}
                    className="card"
                    draggable
                    tabIndex={0}
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', c._id)}
                    onClick={() => onOpen(c)}
                    onKeyDown={(e) => e.key === 'Enter' && onOpen(c)}
                  >
                    <div className="card-top">
                      <span className="avatar">{initials(c.name)}</span>
                      <div>
                        <div className="card-name">{c.name}</div>
                        <div className="card-role">{c.position}</div>
                      </div>
                    </div>
                    <div className="chips">
                      {c.skills.slice(0, 3).map((s) => <span key={s} className="chip">{s}</span>)}
                    </div>
                    <div className="card-foot">
                      <span>{c.experience} yr exp</span>
                      <span>{daysSince(last?.changedAt || c.createdAt)}d in stage</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
