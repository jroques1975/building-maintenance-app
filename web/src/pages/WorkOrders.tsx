const orders = [
  { id: 'WO-501', title: 'Replace thermostat', assignedTo: 'James Wilson', status: 'IN_PROGRESS' },
  { id: 'WO-502', title: 'Fix leak under sink', assignedTo: 'David Smith', status: 'ASSIGNED' },
];

export default function WorkOrders() {
  return (
    <div>
      <h2>Work Orders</h2>
      <p>UAT flow: assignment, technician updates, completion trail.</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {orders.map((o) => (
          <li key={o.id} style={{ background: 'white', marginBottom: 10, borderRadius: 10, padding: 12 }}>
            <strong>{o.id}</strong> — {o.title}
            <div>Assigned to: {o.assignedTo}</div>
            <div>Status: {o.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
