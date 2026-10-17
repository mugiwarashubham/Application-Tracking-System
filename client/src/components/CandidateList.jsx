import { STAGES, STAGE_COLORS, fmtDate } from '../constants';

export default function CandidateList({ candidates, onMove, onOpen }) {
  if (candidates.length === 0) {
    return <p className="empty">No candidates match. Clear the search or filters, or add a new candidate.</p>;
  }
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th>Candidate</th><th>Role</th><th>Experience</th><th>Skills</th><th>Source</th><th>Applied</th><th>Stage</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c._id}>
              <td>
                <button className="link" onClick={() => onOpen(c)}>{c.name}</button>
                <div className="sub">{c.email}</div>
              </td>
              <td>{c.position}</td>
              <td>{c.experience} yr</td>
              <td><div className="chips">{c.skills.slice(0, 3).map((s) => <span key={s} className="chip">{s}</span>)}</div></td>
              <td>{c.source}</td>
              <td>{fmtDate(c.createdAt)}</td>
              <td>
                <select
                  className="stage-select"
                  style={{ color: STAGE_COLORS[c.stage], borderColor: STAGE_COLORS[c.stage] }}
                  value={c.stage}
                  onChange={(e) => onMove(c, e.target.value)}
                  aria-label={`Stage for ${c.name}`}
                >
                  {STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
