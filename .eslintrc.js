// This is the primary JavaScript linting rules for the entire
// project.  In a few places, some of these rules are extended
// or overridden for a particular subset of the project.  See
// other .eslintrc.js files for those rules.
module.exports = {
  plugins: ["react", "mocha", "babel", "cdo-custom-rules"],
  extends: [
    "plugin:prettier/recommended",
    "eslint:recommended",
    "plugin:react/recommended",
  ],
  env: {
    browser: true,
    node: true,
    mocha: true,
  },
  rules: {
    "cdo-custom-rules/style-blocks-below-class": "error",
    "array-bracket-spacing": ["error", "never"],
    "babel/semi": "error", // autofixable
    "brace-style": ["error", "1tbs", { allowSingleLine: true }],
    "comma-dangle": "off",
    curly: "error",
    "dot-location": ["error", "property"],
    "eol-last": "error",
    eqeqeq: "error",
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
    "react/jsx-no-target-blank": "error",
    "react/jsx-wrap-multilines": "error", // autofixable
    "react/no-find-dom-node": "off",
    "react/no-render-return-value": "off",
    "react/no-string-refs": "off",
    "react/no-unescaped-entities": "off",
    "react/self-closing-comp": "error",
    "react/no-danger": "error",
    semi: "off", // enforced by babel/semi
    "space-before-blocks": "error",
    strict: "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
