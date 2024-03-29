// seeders/20240308123456-admin-user.js
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        name: 'admin',
        password: 'l1admin',
        role: 'admin',
        name: 'SuperAdmin',
        email: 'l1@admin.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
