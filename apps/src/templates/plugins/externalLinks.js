/**
 * Open external links in a new tab.
 */
export default function externalLinks(options = {}) {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const original = tokenizers.link;
  const all = options.links === 'all';

  tokenizers.link = function (eat, value, silent) {
    const link = original.call(this, eat, value, silent);
    if (link && link.type === 'link' && (all || isExternalLink(link.url))) {
      link.data = link.data || {};
      link.data.hProperties = link.data.hProperties || {};

      const props = link.data.hProperties;
      props.target = props.target || '_blank';
      props.rel = 'noreferrer noopener';
    }

    return link;
  };
  tokenizers.link.locator = original.locator;
}

// fullyQualified('/educate') => 'http://studio.code.org.localhost:3000/educate'
export function isExternalLink(url) {
  return !/https?:\/\/([^.]+\.)*code.org(\.localhost)?(:[0-9]+)?\//.test(
    fullyQualified(url)
  );
}

let a;
function fullyQualified(path) {
  a = a || document.createElement('a');
  a.href = path;
  return a.href;
}
