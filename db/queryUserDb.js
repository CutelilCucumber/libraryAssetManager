const prisma = require('./prismaClient');

async function getUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username }
  });
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id: parseInt(id) }
  });
}

async function createUser(username, email, hash, salt) {
  const user = await prisma.user.create({
    data: { username, email, hash, salt }
  });
  return user.id;
}

async function addMembership(id) {
  await prisma.user.update({
    where: { id: parseInt(id) },
    data: { role: 'MEMBER' }
  });
}

async function addAdmin(id) {
  await prisma.user.update({
    where: { id: parseInt(id) },
    data: { role: 'ADMIN' }
  });
}

module.exports = {
    getUserByUsername,
    getUserById,
    createUser,
    addMembership,
    addAdmin
}