import { useState } from 'react';
import { apiRequest, getToken } from '../services/api';

export default function WorkOrders() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function testWorkOrdersEndpoint() {
    setError('');
    setResult('Checking...');
    try {
      const res = await apiRequest('/work-orders');
      const total = res?.meta?.pagination?.total ?? res?.data?.workOrders?.length ?? 0;
      setResult(`Connected. Work orders returned: ${total}`);
    } catch (e: any) {
      setResult('');
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Work Orders</h2>
      {!getToken() ? <p>Please login first.</p> : <>
        <p>Live endpoint test for /api/work-orders</p>
        <button onClick={testWorkOrdersEndpoint}>Run Work Order API Check</button>
        {result && <p style={{ color: '#065f46' }}>{result}</p>}
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      </>}
    </div>
  );
}
