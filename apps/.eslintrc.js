module.exports = {
  "extends": "eslint:recommended",
  "parserOptions": {
    // TODO - renable file with spread
    // Though we dont technically support ES6 everywhere, it is used by craft
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "modules": true
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
