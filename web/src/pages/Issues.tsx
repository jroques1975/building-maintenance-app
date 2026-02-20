const issues = [
  { id: 'ISS-101', title: 'AC not cooling', priority: 'HIGH', status: 'ASSIGNED', unit: 'GT-203' },
  { id: 'ISS-102', title: 'Water leak in kitchen', priority: 'EMERGENCY', status: 'IN_PROGRESS', unit: 'GT-805' },
  { id: 'ISS-103', title: 'Hallway light out', priority: 'LOW', status: 'RECEIVED', unit: 'COMMON' },
];

export default function Issues() {
  return (
    <div>
      <h2>Issues</h2>
      <p>UAT flow: submit → assign → update status.</p>
      <table style={{ width: '100%', background: 'white', borderRadius: 10, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 10 }}>ID</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Title</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Priority</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Status</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Unit</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((i) => (
            <tr key={i.id}>
              <td style={{ padding: 10, borderTop: '1px solid #eee' }}>{i.id}</td>
              <td style={{ padding: 10, borderTop: '1px solid #eee' }}>{i.title}</td>
              <td style={{ padding: 10, borderTop: '1px solid #eee' }}>{i.priority}</td>
              <td style={{ padding: 10, borderTop: '1px solid #eee' }}>{i.status}</td>
              <td style={{ padding: 10, borderTop: '1px solid #eee' }}>{i.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
