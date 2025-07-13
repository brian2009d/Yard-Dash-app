// Mock entity implementations for standalone deployment
// These provide basic CRUD operations that work locally

const createMockEntity = (name) => {
  let storage = [];
  let idCounter = 1;

  return {
    async create(data) {
      const record = {
        id: `${name.toLowerCase()}_${idCounter++}`,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
        created_by: 'mock_user@example.com',
        ...data
      };
      storage.push(record);
      return record;
    },

    async list(sort = '', limit = 100) {
      return [...storage].slice(0, limit);
    },

    async filter(conditions, sort = '', limit = 100) {
      let filtered = storage.filter(item => {
        return Object.entries(conditions).every(([key, value]) => 
          item[key] === value
        );
      });
      return filtered.slice(0, limit);
    },

    async get(id) {
      const item = storage.find(item => item.id === id);
      if (!item) throw new Error(`${name} not found`);
      return item;
    },

    async update(id, data) {
      const index = storage.findIndex(item => item.id === id);
      if (index === -1) throw new Error(`${name} not found`);
      
      storage[index] = {
        ...storage[index],
        ...data,
        updated_date: new Date().toISOString()
      };
      return storage[index];
    },

    async delete(id) {
      const index = storage.findIndex(item => item.id === id);
      if (index === -1) throw new Error(`${name} not found`);
      
      const deleted = storage[index];
      storage.splice(index, 1);
      return deleted;
    },

    async bulkCreate(dataArray) {
      return Promise.all(dataArray.map(data => this.create(data)));
    }
  };
};

// Create mock entities
export const Job = createMockEntity('Job');
export const Bid = createMockEntity('Bid');
export const Review = createMockEntity('Review');
export const Transaction = createMockEntity('Transaction');

// Mock User entity with special auth methods
export const User = {
  ...createMockEntity('User'),
  
  async me() {
    // Return a mock current user
    return {
      id: 'mock_user_123',
      email: 'demo@example.com',
      full_name: 'Demo User',
      role: 'user',
      created_date: new Date().toISOString()
    };
  },

  async updateMyUserData(data) {
    console.log('Mock: Updating user data', data);
    return { ...this.me(), ...data };
  },

  async logout() {
    console.log('Mock: User logged out');
    window.location.reload();
  },

  async login() {
    console.log('Mock: Login called');
    alert('This is a demo version. Login functionality is not available.');
  },

  async loginWithRedirect(callbackUrl) {
    console.log('Mock: Login with redirect called', callbackUrl);
    alert('This is a demo version. Login functionality is not available.');
  }
};
