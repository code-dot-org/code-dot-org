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
    'plugin:react/recommended',
    "eslint:recommended",
  ],
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "modules": true,
      "ecmaVersion": 6,
      "experimentalObjectRestSpread": true
    }
  },
  "rules": {
    "array-bracket-spacing": ["error", "never"],
    "brace-style": ["error", "1tbs", { allowSingleLine: true }],
    "comma-dangle": "off",
    curly: "error",
    "dot-location": ["error", "property"],
    "eol-last": "error",
    eqeqeq: "error",
    "jsx-quotes": "error", // autofixable
    "keyword-spacing": "error",
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
    "no-unused-vars": ["error", { args: "none" }],
    "no-useless-escape": "off",
    "no-with": "error",
    "object-curly-spacing": "off",
    "react/button-has-type": "error",
    "react/display-name": "off",
    "react/jsx-closing-bracket-location": "error", // autofixable
    "react/jsx-curly-spacing": "error", // autofixable
    "react/jsx-first-prop-new-line": ["error", "multiline"],
    "react/jsx-indent-props": ["error", 2], // autofixable
    "react/jsx-key": "off",
    "react/jsx-no-target-blank": "off",
    "react/jsx-wrap-multilines": "error", // autofixable
    "react/no-danger": "error",
    "react/no-find-dom-node": "off",
    "react/no-render-return-value": "off",
    "react/no-string-refs": "off",
    "react/no-unescaped-entities": "off",
    "react/self-closing-comp": "error",
    semi: "off", // enforced by babel/semi
    "space-before-blocks": "error",
    strict: "error"

  }
};
