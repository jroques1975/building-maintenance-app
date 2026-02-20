import { useState } from 'react';
import { apiRequest, getToken } from '../services/api';

export default function Issues() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function testIssuesEndpoint() {
    setError('');
    setResult('Checking...');
    try {
      const res = await apiRequest('/issues');
      const total = res?.meta?.pagination?.total ?? res?.data?.issues?.length ?? 0;
      setResult(`Connected. Issues returned: ${total}`);
    } catch (e: any) {
      setResult('');
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Issues</h2>
      {!getToken() ? <p>Please login first.</p> : <>
        <p>Live endpoint test for /api/issues</p>
        <button onClick={testIssuesEndpoint}>Run Issue API Check</button>
        {result && <p style={{ color: '#065f46' }}>{result}</p>}
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
      </>}
    </div>
  );
}
