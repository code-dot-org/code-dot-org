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
    "ReactDOM": true,
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
    "Jigsaw": true
  },
  "env": {
    "browser": true,
    "node": true,
    "mocha": true
  },
  "rules": {
    // 0 means disabled, 1 means warn, 2 means error
    "curly": 2,
    "no-undef": 2,
    "no-unused-vars": 0,
    "comma-dangle": 0,
    "no-empty": 0,
    "semi": 2,
    "no-console": 0,
    "no-extra-boolean-cast": 0,
    "no-regex-spaces": 0
  }
};
