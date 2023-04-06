// This config only defines globals available especially in apps,
// and enables es6. See the root .eslintrc.js for linting rules.
module.exports = {
  "parser": "babel-eslint",
  "plugins": ["react"],
  "parserOptions": {
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "modules": true,
      "ecmaVersion": 6,
      "experimentalObjectRestSpread": true
    }
  },
  "env": {
    "es6": true
  },
  "globals": {
    "Blockly": true,
    "Phaser": true,
    "Studio": true,
    "Maze": true,
    "Turtle": true,
    "Bounce": true,
    "Eval": true,
    "Flappy": true,
    "Applab": true,
    "Calc": true,
    "Jigsaw": true,
    "$": true,
    "jQuery": true,
    "IN_UNIT_TEST": true,
    "IN_STORYBOOK": true,
  },
  rules: {
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
  }
};
