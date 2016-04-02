// This is the primary JavaScript linting rules for the entire
// project.  In a few places, some of these rules are extended
// or overridden for a particular subset of the project.  See
// other .eslintrc.js files for those rules.
module.exports = {
  "extends": "eslint:recommended",
  "env": {
    "browser": true,
    "node": true,
    "mocha": true
  },
  "parserOptions": {
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "modules": true
    }
  },
  "globals": {
    "$": true,
    "jQuery": true,
    "React": true,
    "ReactDOM": true
  },
  "rules": {
    "array-bracket-spacing": ["error", "never"],
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "comma-dangle": "off",
    "curly": "error",
    "eol-last": "error",
    "no-array-constructor": "error",
    "no-console": "off",
    "no-empty": "off",
    "no-eval": "error",
    "no-extra-boolean-cast": "off",
    "no-implicit-globals": "error",
    "no-new-object": "error",
    "no-trailing-spaces": "error",
    "no-undef": "error",
    "no-unused-vars": "off",
    "no-with": "error",
    "semi": "error"
  }
};
