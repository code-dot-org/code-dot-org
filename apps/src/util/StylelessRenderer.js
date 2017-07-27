import marked from 'marked';

const renderer = new marked.Renderer();
renderer.html = function (html) {
  return html.indexOf('<style>') !== -1 ? '' : html;
};
renderer.normalImage = renderer.image;
renderer.image = function (href, title, text) {
  if (text !== 'expandable') {
    return renderer.normalImage(href, title, text);
  }

  return `<span data-url="${href}" class="expandable-image">${text}</span>`;
};

export default renderer;
