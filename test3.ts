import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    });
    console.log('POST Settings Status:', res.status);
    const text = await res.text();
    console.log('POST Settings Response:', text);
    
    const res2 = await fetch('http://localhost:3000/api/settings');
    console.log('GET Settings Status:', res2.status);
    const text2 = await res2.text();
    console.log('GET Settings Response:', text2);
  } catch (e) {
    console.error(e);
  }
}
test();
