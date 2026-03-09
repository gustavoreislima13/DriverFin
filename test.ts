import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'test1',
        type: 'expense',
        amount: 100,
        category: 'Test',
        date: '2023-10-01T12:00:00.000Z'
      })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
    
    const res2 = await fetch('http://localhost:3000/api/transactions');
    console.log('GET Status:', res2.status);
    const text2 = await res2.text();
    console.log('GET Response:', text2);
  } catch (e) {
    console.error(e);
  }
}
test();
