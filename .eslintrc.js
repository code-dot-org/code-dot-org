// This is the primary JavaScript linting rules for the entire
// project.  In a few places, some of these rules are extended
// or overridden for a particular subset of the project.  See
// other .eslintrc.js files for those rules.
module.exports = {
  "plugins": [
    "react",
    "mocha",
    "babel",
  ],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "env": {
    "browser": true,
    "node": true,
    "mocha": true,
  },
  "rules": {
    "array-bracket-spacing": ["error", "never"],
    "babel/semi": "error", // autofixable
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "comma-dangle": "off",
    "curly": "error",
    "dot-location": ["error", "property"],
    "eol-last": "error",
    "eqeqeq": "error",
    "jsx-quotes": "error", // autofixable
    "keyword-spacing": "error",
    "mocha/no-exclusive-tests": "error",
    "no-array-constructor": "error",
    "no-console": "off",
    "no-duplicate-imports": "error",
    "no-empty": "off",
    "no-eval": "error",
    "no-ex-assign": "off",
    "no-extra-boolean-cast": "off",
    "no-implicit-globals": "error",
    "no-new-object": "error",
    "no-trailing-spaces": "error",
    "no-undef": "error",
    "no-unused-vars": ['error', {"args": 'none'}],
    "no-with": "error",
    "object-curly-spacing": "off",
    "react/display-name": "off",
    "react/jsx-closing-bracket-location": "error", // autofixable
    "react/jsx-curly-spacing": "error", // autofixable
    "react/jsx-first-prop-new-line": ["error", "multiline"],
    "react/jsx-indent-props": ["error", 2], // autofixable
    "react/no-render-return-value": "off", // TODO: turn this on
    "react/self-closing-comp": "error",
    "react/wrap-multilines": "error", // autofixable
    "semi": "off", // enforced by babel/semi
    "space-before-blocks": "error",
    "space-before-function-paren": ["error", {
      "anonymous": "always",
      "named": "never"
    }],
    "strict": "error",
  }
};
