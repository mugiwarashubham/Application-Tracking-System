import { useEffect, useState } from 'react';
import { api } from './api';
import { STAGES } from './constants';
import Dashboard from './components/Dashboard.jsx';
import Board from './components/Board.jsx';
import CandidateList from './components/CandidateList.jsx';
import CandidateModal from './components/CandidateModal.jsx';

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'board', label: 'Pipeline' },
  { id: 'list', label: 'Candidates' },
];

export default function App() {
  const [view, setView] = useState('dashboard');
  const [filters, setFilters] = useState({ q: '', stage: '', position: '', sort: '-createdAt' });
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [positions, setPositions] = useState([]);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, object = existing
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);
  const notify = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  // Debounced search + filters
  useEffect(() => {
    const t = setTimeout(() => {
      const params = { limit: 500, sort: filters.sort };
      if (filters.q) params.q = filters.q;
      if (filters.position) params.position = filters.position;
      if (view === 'list' && filters.stage) params.stage = filters.stage;
      api.list(params)
        .then((r) => { setCandidates(r.data); setTotal(r.total); })
        .catch((e) => notify(e.message, true));
    }, 250);
    return () => clearTimeout(t);
  }, [filters, view, refreshKey]);

  useEffect(() => {
    api.meta().then((m) => setPositions(m.positions)).catch(() => {});
  }, [refreshKey]);

  const move = async (candidate, stage) => {
    if (candidate.stage === stage) return;
    setCandidates((cs) => cs.map((c) => (c._id === candidate._id ? { ...c, stage } : c))); // optimistic
    try {
      await api.move(candidate._id, stage);
      notify(`${candidate.name} moved to ${stage}`);
    } catch (e) {
      notify(e.message, true);
    }
    refresh();
  };

  // Throws on failure so the modal can show the message inline
  const save = async (data) => {
    if (data._id) await api.update(data._id, data);
    else await api.create(data);
    setEditing(null);
    notify(data._id ? 'Candidate updated' : 'Candidate added');
    refresh();
  };

  const remove = async (c) => {
    try {
      await api.remove(c._id);
      setEditing(null);
      notify('Candidate deleted');
      refresh();
    } catch (e) {
      notify(e.message, true);
    }
  };

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="shell">
      <aside className="rail">
        <div className="brand">Shortlist</div>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={view === n.id ? 'nav active' : 'nav'} onClick={() => setView(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1>{NAV.find((n) => n.id === view).label}</h1>
          <button className="btn primary" onClick={() => setEditing({})}>Add candidate</button>
        </header>

        {view !== 'dashboard' && (
          <div className="toolbar">
            <input
              className="search"
              type="search"
              placeholder="Search by name, email, role or skill"
              value={filters.q}
              onChange={set('q')}
              aria-label="Search candidates"
            />
            <select value={filters.position} onChange={set('position')} aria-label="Filter by role">
              <option value="">All roles</option>
              {positions.map((p) => <option key={p}>{p}</option>)}
            </select>
            {view === 'list' && (
              <>
                <select value={filters.stage} onChange={set('stage')} aria-label="Filter by stage">
                  <option value="">All stages</option>
                  {STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={filters.sort} onChange={set('sort')} aria-label="Sort">
                  <option value="-createdAt">Newest first</option>
                  <option value="createdAt">Oldest first</option>
                  <option value="name">Name A–Z</option>
                  <option value="-experience">Most experience</option>
                </select>
              </>
            )}
            <span className="count">{total} {total === 1 ? 'candidate' : 'candidates'}</span>
          </div>
        )}

        {view === 'dashboard' && <Dashboard refreshKey={refreshKey} />}
        {view === 'board' && <Board candidates={candidates} onMove={move} onOpen={setEditing} />}
        {view === 'list' && <CandidateList candidates={candidates} onMove={move} onOpen={setEditing} />}
      </main>

      {editing && (
        <CandidateModal candidate={editing} onSave={save} onDelete={remove} onClose={() => setEditing(null)} />
      )}
      {toast && <div className={toast.error ? 'toast error' : 'toast'} role="status">{toast.msg}</div>}
    </div>
  );
}
