export default function Dashboard() {
  return (
    <div>
      <h1>Building Maintenance Dashboard</h1>
      <p>UAT shell is active. Use the left navigation to walk each flow.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
        <Card label='Open Issues' value='12' />
        <Card label='Work Orders In Progress' value='5' />
        <Card label='Active Operator Period' value='Sunrise HOA' />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 10, padding: 12 }}>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
