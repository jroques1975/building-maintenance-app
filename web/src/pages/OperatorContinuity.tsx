import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getToken } from '../services/api';

export default function OperatorContinuity() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [history, setHistory] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [operatorType, setOperatorType] = useState<'PM' | 'HOA'>('PM');
  const [toOperatorId, setToOperatorId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 16));
  const [handoffNotes, setHandoffNotes] = useState('UAT transition');

  const activePeriodId = useMemo(() => timeline.find((p) => p.status === 'ACTIVE')?.id ?? '', [timeline]);

  async function loadBuildingData(buildingId: string) {
    setErr('');
    const [historyRes, timelineRes] = await Promise.all([
      apiRequest(`/buildings/${buildingId}/history`),
      apiRequest(`/buildings/${buildingId}/operator-timeline`),
    ]);
    setHistory(historyRes.data);
    setTimeline(timelineRes.data?.timeline ?? []);
  }

  useEffect(() => {
    if (!getToken()) return;
    apiRequest('/portfolio/buildings')
      .then((r) => {
        const list = r?.data?.buildings ?? [];
        setBuildings(list);
        if (list[0]?.id) {
          setSelected(list[0].id);
          loadBuildingData(list[0].id).catch((e) => setErr(e.message));
        }
      })
      .catch((e) => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!selected) return;
    loadBuildingData(selected).catch((e) => setErr(e.message));
  }, [selected]);

  async function runTransition(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setErr('');
    setLoading(true);
    try {
      await apiRequest(`/buildings/${selected}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          fromOperatorPeriodId: activePeriodId || undefined,
          toOperatorType: operatorType,
          toOperatorId,
          effectiveDate: new Date(effectiveDate).toISOString(),
          handoffNotes,
        }),
      });
      setMsg('Transition created successfully. Timeline refreshed.');
      await loadBuildingData(selected);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!getToken()) return <p>Please login first.</p>;

  return (
    <div>
      <h2>Operator Continuity</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Building: </label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {buildings.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
        </select>
      </div>

      <form onSubmit={runTransition} style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 12 }}>
        <h3>Create Transition</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(220px,1fr))', gap: 10 }}>
          <label>
            Operator Type
            <select value={operatorType} onChange={(e) => setOperatorType(e.target.value as 'PM' | 'HOA')}>
              <option value='PM'>PM</option>
              <option value='HOA'>HOA</option>
            </select>
          </label>
          <label>
            To Operator ID
            <input value={toOperatorId} onChange={(e) => setToOperatorId(e.target.value)} placeholder='cuid...' />
          </label>
          <label>
            Effective Date
            <input type='datetime-local' value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          </label>
          <label>
            Notes
            <input value={handoffNotes} onChange={(e) => setHandoffNotes(e.target.value)} />
          </label>
        </div>
        <button disabled={loading || !selected || !toOperatorId} style={{ marginTop: 10 }}>
          {loading ? 'Submitting...' : 'Run Transition'}
        </button>
      </form>

      {msg && <p style={{ color: '#065f46' }}>{msg}</p>}
      {err && <p style={{ color: '#b91c1c' }}>{err}</p>}

      <div style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 12 }}>
        <h3>Timeline</h3>
        {timeline.map((p: any) => (
          <div key={p.id} style={{ padding: 10, borderBottom: '1px solid #eee' }}>
            <strong>{p.id}</strong> — {p.managementCompany?.name || p.hoaOrganization?.name || 'Unknown'} ({p.operatorType})
            <div>Status: {p.status}</div>
          </div>
        ))}
        {timeline.length === 0 && <div>No periods found.</div>}
      </div>

      <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
        <h3>History Totals</h3>
        {history?.periods?.map((p: any) => (
          <div key={p.id} style={{ padding: 10, borderBottom: '1px solid #eee' }}>
            <strong>{p.id}</strong> — Totals: {p.totals?.issues ?? 0} issues / {p.totals?.workOrders ?? 0} work orders
          </div>
        ))}
        {!history && <div>Loading history...</div>}
      </div>
    </div>
  );
}
