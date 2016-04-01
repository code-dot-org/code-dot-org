module.exports = {
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
  "rules": {
    // 0 means disabled, 1 means warn, 2 means error
    "no-extra-boolean-cast": 0,
    "no-regex-spaces": 0
  }
};
