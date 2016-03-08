module.exports = {
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
  },
  "globals": {
    "$": true,
    "jQuery": true,
    "React": true,
    "ReactDOM": true
  },
  "env": {
    "browser": true,
    "node": true,
  },
  "rules": {
    // 0 means disabled, 1 means warn, 2 means error
    "curly": 2,
    "no-undef": 2,
    "no-unused-vars": 0,
    "comma-dangle": 0,
    "no-empty": 0,
    "semi": 2
  }
};
