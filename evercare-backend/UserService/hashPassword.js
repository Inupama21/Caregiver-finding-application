const bcrypt = require('bcrypt');

const password = 'Admin@1234';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Original password:', password);
console.log('Hashed password:', hashedPassword);
console.log('');
console.log('Use this hashed password in your database:');
console.log(hashedPassword);
