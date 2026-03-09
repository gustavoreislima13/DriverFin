import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://ais-dev-c74zvaxp3sbcbl42fgo4ej-152873168782.us-west2.run.app/api/transactions');
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log('Response:', text.substring(0, 200));
  } catch (e) {
    console.error(e);
  }
}
test();
