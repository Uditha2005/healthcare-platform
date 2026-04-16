const rootUrl = 'http://localhost';
const authPort = 5001;
const patientPort = 3002;
const appointmentPort = 3003;
const patientEmail = 'member2_test@example.com';
const patientPassword = 'password123';

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  const text = await res.text();
  let body = text;
  try { body = JSON.parse(text); } catch (err) {}
  return { status: res.status, body };
};

const registerOrLogin = async () => {
  const registerUrl = `${rootUrl}:${authPort}/api/auth/register`;
  const loginUrl = `${rootUrl}:${authPort}/api/auth/login`;
  const payload = { name: 'Member 2 Test Patient', email: patientEmail, password: patientPassword, role: 'patient' };

  const register = await fetchJson(registerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (register.status === 201 && register.body.token) {
    console.log('REGISTER OK');
    return register.body.token;
  }

  if (register.status === 400) {
    console.log('REGISTER SKIPPED, USER EXISTS');
  } else {
    console.log('REGISTER RESPONSE', register.status, register.body);
  }

  const login = await fetchJson(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: patientEmail, password: patientPassword })
  });

  console.log('LOGIN RESPONSE', login.status, login.body);
  if (login.status === 200 && login.body.token) {
    return login.body.token;
  }

  throw new Error('Unable to register or login');
};

const main = async () => {
  const token = await registerOrLogin();
  console.log('TOKEN LENGTH', token.length);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const profileUrl = `${rootUrl}:${patientPort}/api/patient/profile`;
  const historyUrl = `${rootUrl}:${patientPort}/api/patient/history`;
  const appointmentUrl = `${rootUrl}:${appointmentPort}/api/appointment`;
  const doctorSearchUrl = `${rootUrl}:${appointmentPort}/api/appointment/doctors?specialty=cardiology`;

  const profileUpdate = await fetchJson(profileUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ phone: '0771234567', address: 'Colombo', dateOfBirth: '1990-01-01', gender: 'male' })
  });
  console.log('PROFILE UPDATE', profileUpdate.status, profileUpdate.body);

  const profileGet = await fetchJson(profileUrl, { headers });
  console.log('PROFILE GET', profileGet.status, profileGet.body);

  const historyGet = await fetchJson(historyUrl, { headers });
  console.log('HISTORY GET', historyGet.status, historyGet.body);

  const appointmentCreate = await fetchJson(appointmentUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ doctorId: '64c9b3c1f4d2bc0012345678', specialty: 'general', date: '2026-05-01', time: '10:00', notes: 'Test booking' })
  });
  console.log('APPOINTMENT CREATE', appointmentCreate.status, appointmentCreate.body);

  const appointmentList = await fetchJson(appointmentUrl, { headers });
  console.log('APPOINTMENT LIST', appointmentList.status, appointmentList.body);

  const doctorSearch = await fetchJson(doctorSearchUrl, { headers });
  console.log('DOCTOR SEARCH', doctorSearch.status, doctorSearch.body);
};

main().catch((err) => { console.error('ERROR', err.message); process.exit(1); });
