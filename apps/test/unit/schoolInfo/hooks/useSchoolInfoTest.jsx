
// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {};

  return {
    getItem: jest.fn().mockImplementation(key => {
      return store[key] || null;
    }),
    setItem: jest.fn().mockImplementation((key, value) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {value: mockSessionStorage});

