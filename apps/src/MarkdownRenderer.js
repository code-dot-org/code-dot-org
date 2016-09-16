var marked = require('marked');

var renderer = new marked.Renderer();
renderer.html = function (html) {
  return html.indexOf('<style>') !== -1 ? '' : html;
};
marked.setOptions({
  renderer: renderer,
});

export default marked;
