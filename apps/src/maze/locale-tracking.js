module.exports = function(str_fn, ...args) {
  console.log(str_fn);
  return window.blockly.maze_locale[str_fn](args);
}
