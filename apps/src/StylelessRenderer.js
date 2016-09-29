import marked from 'marked';

const renderer = new marked.Renderer();
renderer.html = function (html) {
  return html.indexOf('<style>') !== -1 ? '' : html;
};

export default renderer;
