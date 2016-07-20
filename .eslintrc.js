// This is the primary JavaScript linting rules for the entire
// project.  In a few places, some of these rules are extended
// or overridden for a particular subset of the project.  See
// other .eslintrc.js files for those rules.
module.exports = {
  "plugins": [
    "react"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "env": {
    "browser": true,
    "node": true,
    "mocha": true,
    "es6": true
  },
  "parserOptions": {
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "modules": true,
      "ecmaVersion": 6
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
    "jsx-quotes": "off",
    "keyword-spacing": "error",
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
    "object-curly-spacing": "off",
    "react/display-name": "off",
    "react/jsx-closing-bracket-location": "off",
    "react/jsx-curly-spacing": "off",
    "react/jsx-first-prop-new-line": ["off", "multiline"],
    "react/jsx-indent-props": ["off", 2],
    "react/jsx-max-props-per-line": ["off", { "maximum": 1 }],
    "react/no-render-return-value": "off", // TODO: turn this on
    "react/self-closing-comp": "off",
    "react/wrap-multilines": "off",
    "semi": "error",
    "space-before-function-paren": ["error", {
      "anonymous": "always",
      "named": "never"
    }]
  }
};
