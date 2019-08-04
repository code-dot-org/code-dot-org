// This is the primary JavaScript linting rules for the entire
// project.  In a few places, some of these rules are extended
// or overridden for a particular subset of the project.  See
// other .eslintrc.js files for those rules.
module.exports = {
  "globals": {
  },
  "plugins": [
  ],
  "extends": [
    "eslint:recommended",
  ],
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2017,
    "ecmaFeatures": {
      "jsx": true,
      "modules": true,
      "ecmaVersion": 6,
      "experimentalObjectRestSpread": true
    }
  },
  "rules": {
    "array-bracket-spacing": ["error", "never"],
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "comma-dangle": "off",
    "curly": "error",
    "dot-location": ["error", "property"],
    "eol-last": "error",
    "eqeqeq": "error",
    "jsx-quotes": "error", // autofixable
    "keyword-spacing": "error",
    "indent": ["error", 2, {"SwitchCase": 1}],
    "no-array-constructor": "error",
    "no-console": "off",
    "no-duplicate-imports": "error",
    "no-empty": "off",
    "no-eval": "error",
    "no-extra-boolean-cast": "off",
    "no-implicit-globals": "error",
    "no-new-object": "error",
    "no-trailing-spaces": "error",
    "no-undef": "error",
    "no-unused-vars": "error",
    "no-with": "error",
    "object-curly-spacing": "off",
    "semi": "error",
    "space-before-function-paren": ["error", {
      "anonymous": "always",
      "named": "never"
    }],
    "strict": "error",
  }
};
