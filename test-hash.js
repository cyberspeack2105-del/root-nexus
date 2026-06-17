const bcryptjs = require('bcryptjs');

const password = 'RootNexus@2025';
const hash = '$2b$12$2e2Hxo9ouRMo5XsLZdAZiuRGV1Hoh2ElMudpMtK7B18KgHMzu7IiG';

bcryptjs.compare(password, hash).then(result => {
  console.log('Password matches hash:', result);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
