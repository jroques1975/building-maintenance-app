import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const checks = [
  { id: 'UAT-A01', label: 'Tenant denied operator portfolio/history' },
  { id: 'UAT-A02', label: 'Maintenance denied operator-period writes' },
  { id: 'UAT-B01', label: 'Transition closes old ACTIVE and opens new ACTIVE' },
  { id: 'UAT-B02', label: 'History grouped by operator period' },
  { id: 'UAT-B04', label: 'History filters (status/from/to) work' },
  { id: 'UAT-B05', label: 'History pagination (limit/offset) works' },
  { id: 'UAT-C01', label: 'Issue bound to active operator period' },
  { id: 'UAT-C02', label: 'Work order bound from linked issue period' },
];

type State = 'pending' | 'pass' | 'fail' | 'blocked';

export default function UatCommandCenter() {
  const [state, setState] = useState<Record<string, State>>({});
  const [exportMsg, setExportMsg] = useState('');

  const summary = useMemo(() => {
    const values = Object.values(state);
    return {
      pass: values.filter((v) => v === 'pass').length,
      fail: values.filter((v) => v === 'fail').length,
      blocked: values.filter((v) => v === 'blocked').length,
      pending: checks.length - values.length,
    };
  }, [state]);

  function setStatus(id: string, s: State) {
    setState((prev) => ({ ...prev, [id]: s }));
  }

  const markdownSummary = useMemo(() => {
    const lines = [
      '# UAT Execution Summary',
      '',
      `- Pass: ${summary.pass}`,
      `- Fail: ${summary.fail}`,
      `- Blocked: ${summary.blocked}`,
      `- Pending: ${summary.pending}`,
      '',
      '| ID | Scenario | Status |',
      '|---|---|---|',
      ...checks.map((c) => `| ${c.id} | ${c.label} | ${(state[c.id] ?? 'pending').toUpperCase()} |`),
    ];
    return lines.join('\n');
  }, [state, summary]);

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdownSummary);
      setExportMsg('Copied markdown summary to clipboard.');
    } catch {
      setExportMsg('Copy failed. Select and copy manually from the box below.');
    }
  }

  return (
    <div>
      <h2>UAT Command Center</h2>
      <p>Run critical scenarios quickly and mark outcomes during execution.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(120px,1fr))', gap: 10, marginBottom: 12 }}>
        <Stat label='Pass' value={summary.pass} color='#065f46' />
        <Stat label='Fail' value={summary.fail} color='#b91c1c' />
        <Stat label='Blocked' value={summary.blocked} color='#92400e' />
        <Stat label='Pending' value={summary.pending} color='#1f2937' />
      </div>

      <div style={{ marginBottom: 12 }}>
        Quick links: <Link to='/login'>Login</Link> · <Link to='/operator-continuity'>Operator Continuity</Link> · <Link to='/issues'>Issues</Link> · <Link to='/work-orders'>Work Orders</Link>
      </div>

      <div style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 12 }}>
        <h3>Export</h3>
        <p style={{ marginTop: 0 }}>Copy this markdown into <code>05-Development/UAT-Execution-Sheet.md</code> or your report thread.</p>
        <button onClick={copyMarkdown}>Copy Markdown Summary</button>
        {exportMsg && <span style={{ marginLeft: 10, color: '#6b7280' }}>{exportMsg}</span>}
        <textarea
          value={markdownSummary}
          readOnly
          style={{ marginTop: 10, width: '100%', minHeight: 180, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}
        />
      </div>

      <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
        {checks.map((c) => {
          const s = state[c.id] ?? 'pending';
          return (
            <div key={c.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <div style={{ fontWeight: 600 }}>{c.id}</div>
              <div style={{ marginBottom: 8 }}>{c.label}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStatus(c.id, 'pass')}>Pass</button>
                <button onClick={() => setStatus(c.id, 'fail')}>Fail</button>
                <button onClick={() => setStatus(c.id, 'blocked')}>Blocked</button>
                <button onClick={() => setStatus(c.id, 'pending')}>Reset</button>
                <span style={{ marginLeft: 8, color: '#6b7280' }}>Current: {s.toUpperCase()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
