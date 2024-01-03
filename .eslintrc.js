// This is the primary JavaScript linting rules for the entire
// project.  In a few places, some of these rules are extended
// or overridden for a particular subset of the project.  See
// other .eslintrc.js files for those rules.
module.exports = {
  extends: ["eslint:recommended"],
  env: {
    browser: true,
    node: true,
    mocha: true,
  },
  rules: {
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
    "no-redeclare": ["error", { builtinGlobals: true }],

    // In Feb 2022, we voted to deprecate Radium (proposal at https://docs.google.com/document/d/1Y3uK_iYMhTUaCI6yIDwOAMprIJCuzXSs2fECQggwp60/edit#heading=h.htf3pg55q2kt)
    // We are now using 'react-bootstrap-2'. See further work at https://github.com/code-dot-org/code-dot-org/pull/51681
    "no-restricted-imports": ["error", "radium", "react-bootstrap"],

    "no-trailing-spaces": "error",
    "no-undef": "error",
    "no-unused-vars": ["error", { args: "none" }],
    "no-useless-escape": "off",
    "no-with": "error",
    "object-curly-spacing": "off",
    semi: "off", // enforced by babel/semi
    "space-before-blocks": "error",
    strict: "error",
  },
};
