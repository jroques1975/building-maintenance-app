import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getToken } from '../services/api';

export default function OperatorContinuity() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [history, setHistory] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [knownOperators, setKnownOperators] = useState<Array<{id:string;name:string;type:'PM'|'HOA'}>>([]);
  const [loading, setLoading] = useState(false);
  const [operatorType, setOperatorType] = useState<'PM' | 'HOA'>('PM');
  const [toOperatorId, setToOperatorId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 16));
  const [handoffNotes, setHandoffNotes] = useState('UAT transition');

  const [historyStatus, setHistoryStatus] = useState('');
  const [historyFrom, setHistoryFrom] = useState('');
  const [historyTo, setHistoryTo] = useState('');
  const [periodLimit, setPeriodLimit] = useState('20');
  const [periodOffset, setPeriodOffset] = useState('0');
  const [includeUnassigned, setIncludeUnassigned] = useState(true);

  const activePeriodId = useMemo(() => timeline.find((p) => p.status === 'ACTIVE')?.id ?? '', [timeline]);

  function toIsoOrUndefined(v: string) {
    if (!v) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  function buildHistoryQuery() {
    const params = new URLSearchParams();
    if (historyStatus) params.set('status', historyStatus);
    const fromIso = toIsoOrUndefined(historyFrom);
    const toIso = toIsoOrUndefined(historyTo);
    if (fromIso) params.set('from', fromIso);
    if (toIso) params.set('to', toIso);
    if (periodLimit) params.set('periodLimit', periodLimit);
    if (periodOffset) params.set('periodOffset', periodOffset);
    params.set('includeUnassigned', String(includeUnassigned));
    const q = params.toString();
    return q ? `?${q}` : '';
  }

  async function loadBuildingData(buildingId: string) {
    setErr('');
    const [historyRes, timelineRes] = await Promise.all([
      apiRequest(`/buildings/${buildingId}/history${buildHistoryQuery()}`),
      apiRequest(`/buildings/${buildingId}/operator-timeline`),
    ]);
    setHistory(historyRes);
    const tl = timelineRes.data?.timeline ?? [];
    setTimeline(tl);
    const known: Array<{ id: string; name: string; type: 'PM' | 'HOA' }> = tl
      .map((p: any) => p.managementCompany ? { id: p.managementCompany.id, name: p.managementCompany.name, type: 'PM' as const } : p.hoaOrganization ? { id: p.hoaOrganization.id, name: p.hoaOrganization.name, type: 'HOA' as const } : null)
      .filter((x: any): x is { id: string; name: string; type: 'PM' | 'HOA' } => Boolean(x));
    setKnownOperators(Array.from(new Map(known.map((k) => [k.id, k])).values()));
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
  }, [selected, historyStatus, historyFrom, historyTo, periodLimit, periodOffset, includeUnassigned]);

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
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Known {operatorType} operators: {knownOperators.filter((k) => k.type === operatorType).map((k) => `${k.name} (${k.id})`).join(', ') || 'none in timeline'}
            </div>
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
        <h3>History Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(180px,1fr))', gap: 10 }}>
          <label>
            Status
            <select value={historyStatus} onChange={(e) => setHistoryStatus(e.target.value)}>
              <option value=''>All</option>
              <option value='ACTIVE'>ACTIVE</option>
              <option value='PENDING'>PENDING</option>
              <option value='ENDED'>ENDED</option>
              <option value='TERMINATED'>TERMINATED</option>
              <option value='RENEWED'>RENEWED</option>
            </select>
          </label>
          <label>
            From
            <input type='datetime-local' value={historyFrom} onChange={(e) => setHistoryFrom(e.target.value)} />
          </label>
          <label>
            To
            <input type='datetime-local' value={historyTo} onChange={(e) => setHistoryTo(e.target.value)} />
          </label>
          <label>
            Period limit
            <input value={periodLimit} onChange={(e) => setPeriodLimit(e.target.value)} />
          </label>
          <label>
            Period offset
            <input value={periodOffset} onChange={(e) => setPeriodOffset(e.target.value)} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
            <input type='checkbox' checked={includeUnassigned} onChange={(e) => setIncludeUnassigned(e.target.checked)} />
            Include unassigned
          </label>
        </div>
      </div>

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
        {history?.meta && (
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
            Returned periods: {history.meta.periodsReturned} | limit: {history.meta.periodLimit ?? 'none'} | offset: {history.meta.periodOffset}
          </div>
        )}
        {history?.data?.periods?.map((p: any) => (
          <div key={p.id} style={{ padding: 10, borderBottom: '1px solid #eee' }}>
            <strong>{p.id}</strong> — Totals: {p.totals?.issues ?? 0} issues / {p.totals?.workOrders ?? 0} work orders
          </div>
        ))}
        {!history && <div>Loading history...</div>}
      </div>
    </div>
  );
}
