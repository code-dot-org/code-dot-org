module.exports = {
  "extends": "eslint:recommended",
  "parserOptions": {
    // Ideally we would only support ES6 in craft until we've said we're going
    // to support it everywhere. However, maintaining two separate lint configs
    // seems like more of a pain than we want.
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
    "curly": "error",
    "no-undef": "error",
    "no-unused-vars": "off",
    "comma-dangle": "off",
    "no-empty": "off",
    "no-implicit-globals": "error",
    "semi": "error",
    "no-console": "off",
    "no-extra-boolean-cast": "off"
  }
};
