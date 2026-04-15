const jwt = require('./services/auth-service/node_modules/jsonwebtoken');

(async () => {
  try {
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'postman_test2@example.com', password: 'password123' })
    });
    const loginBody = await loginRes.json();
    console.log('LOGIN', loginRes.status, JSON.stringify(loginBody));
    if (loginBody.token === undefined) return;
    const token = loginBody.token;
    console.log('TOKEN LENGTH', token.length);
    try {
      const payload = jwt.verify(token, 'supersecretkey');
      console.log('LOCAL VERIFY OK', payload);
    } catch (verifyError) {
      console.log('LOCAL VERIFY FAILED', verifyError.message);
    }

    const urls = [
      { name: 'patientProfile', url: 'http://localhost:3002/api/patient/profile' },
      { name: 'patientHistory', url: 'http://localhost:3002/api/patient/history' },
      { name: 'appointments', url: 'http://localhost:3003/api/appointment' },
      { name: 'appointmentSearch', url: 'http://localhost:3003/api/appointment/doctors?specialty=cardiology' }
    ];
    for (const item of urls) {
      const res = await fetch(item.url, { headers: { Authorization: 'Bearer ' + token } });
      const body = await res.text();
      console.log(item.name, res.status, body);
    }
  } catch (e) {
    console.log('ERROR', e.message);
  }
})();
