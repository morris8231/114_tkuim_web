const { findUserByEmail, createUser } = require('./repositories/users');

async function seedDefaultUsers() {
  const adminEmail = 'admin@example.com';
  const studentEmail = 'student@example.com';
  const admin = await findUserByEmail(adminEmail);
  if (!admin) {
    await createUser({ email: adminEmail, password: 'admin123', role: 'admin' });
    console.log(`[seed] admin user created: ${adminEmail} / admin123`);
  }
  const student = await findUserByEmail(studentEmail);
  if (!student) {
    await createUser({ email: studentEmail, password: 'student123', role: 'student' });
    console.log(`[seed] student user created: ${studentEmail} / student123`);
  }
}

module.exports = { seedDefaultUsers };
