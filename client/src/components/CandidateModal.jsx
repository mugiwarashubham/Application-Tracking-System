import { useState } from 'react';
import { SOURCES, STAGES, STAGE_COLORS, fmtDate } from '../constants';

export default function CandidateModal({ candidate, onSave, onDelete, onClose }) {
  const isNew = !candidate._id;
  const [form, setForm] = useState({
    name: candidate.name || '',
    email: candidate.email || '',
    phone: candidate.phone || '',
    position: candidate.position || '',
    experience: candidate.experience ?? 0,
    source: candidate.source || 'LinkedIn',
    stage: candidate.stage || 'Applied',
    skills: (candidate.skills || []).join(', '),
    notes: candidate.notes || '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave({ ...form, _id: candidate._id, experience: Number(form.experience) });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    if (window.confirm(`Delete ${candidate.name}? This cannot be undone.`)) onDelete(candidate);
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="drawer" onSubmit={submit} role="dialog" aria-modal="true" aria-label={isNew ? 'Add candidate' : 'Edit candidate'}>
        <header className="drawer-head">
          <h2>{isNew ? 'Add candidate' : candidate.name}</h2>
          <button type="button" className="btn ghost" onClick={onClose}>Close</button>
        </header>

        <div className="fields">
          <label>Full name<input required value={form.name} onChange={set('name')} /></label>
          <label>Email<input required type="email" value={form.email} onChange={set('email')} /></label>
          <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
          <label>Role applied for<input required value={form.position} onChange={set('position')} placeholder="e.g. Backend Developer" /></label>
          <label>Years of experience<input type="number" min="0" step="0.5" value={form.experience} onChange={set('experience')} /></label>
          <label>
            Source
            <select value={form.source} onChange={set('source')}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label>
            Stage
            <select value={form.stage} onChange={set('stage')}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label className="full">Skills (comma separated)<input value={form.skills} onChange={set('skills')} placeholder="React, Node.js, MongoDB" /></label>
          <label className="full">Notes<textarea rows="4" value={form.notes} onChange={set('notes')} /></label>
        </div>

        {!isNew && candidate.stageHistory?.length > 0 && (
          <div className="history">
            <h3>Stage history</h3>
            <ol>
              {[...candidate.stageHistory].reverse().map((h, i) => (
                <li key={i}>
                  <span className="dot" style={{ background: STAGE_COLORS[h.stage] }} />
                  <span>{h.stage}</span>
                  <span className="sub">{fmtDate(h.changedAt)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        <footer className="drawer-foot">
          {!isNew && <button type="button" className="btn danger" onClick={confirmDelete}>Delete candidate</button>}
          <span className="spacer" />
          <button type="submit" className="btn primary" disabled={busy}>{isNew ? 'Add candidate' : 'Save changes'}</button>
        </footer>
      </form>
    </div>
  );
}
