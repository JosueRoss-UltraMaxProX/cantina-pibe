// AsyncStorage para web usando localStorage
const AsyncStorage = {
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  getItem: async (key) => {
    try {
      const value = localStorage.getItem(key);
      return Promise.resolve(value);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  multiRemove: async (keys) => {
    try {
      keys.forEach(key => localStorage.removeItem(key));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  getAllKeys: async () => {
    try {
      const keys = Object.keys(localStorage);
      return Promise.resolve(keys);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  clear: async () => {
    try {
      localStorage.clear();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

export default AsyncStorage;