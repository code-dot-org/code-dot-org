const fs = require('fs');
const path = require('path');

const Parser = require('@code-dot-org/redactable-markdown/src/redactableMarkdownParser');

const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const rehypeSanitize = require('rehype-sanitize');
const rehypeStringify = require('rehype-stringify');
const defaultSanitizationSchema = require('hast-util-sanitize/lib/github.json');

const details = require('../src/templates/plugins/details');
const expandableImages = require('../src/templates/plugins/expandableImages');
const xmlAsTopLevelBlock = require('../src/templates/plugins/xmlAsTopLevelBlock');

// create custom sanitization schema as per
// https://github.com/syntax-tree/hast-util-sanitize#schema
// to support our custom syntaxes
const schema = Object.assign({}, defaultSanitizationSchema);

// We use a _lot_ of image formatting stuff in our
// instructions, particularly in CSP
schema.attributes.img.push('height', 'width');

// Add support for expandableImages
schema.tagNames.push('span');
schema.attributes.span = ['dataUrl', 'className'];

// Add support for inline styles (gross)
// TODO replace all inline styles in our curriculum content with
// semantically-significant content
schema.attributes['*'].push('style', 'className');

// Add support for Blockly XML
schema.clobber = [];
const blocklyTags = [
  'block',
  'functional_input',
  'mutation',
  'next',
  'statement',
  'title',
  'value',
  'xml'
];
schema.tagNames = schema.tagNames.concat(blocklyTags);
blocklyTags.forEach(tag => {
  schema.attributes[tag] = ['block_text', 'id', 'inline', 'name', 'type'];
});

const parser = Parser.create()
  .getParser()
  // include custom plugins
  .use([xmlAsTopLevelBlock, expandableImages, details])
  // convert markdown to an HTML Abstract Syntax Tree (HAST)
  .use(remarkRehype, {
    // include any raw HTML in the markdown as raw HTML nodes in the HAST
    allowDangerousHTML: true
  })
  // parse the raw HTML nodes in the HAST to actual HAST nodes
  .use(rehypeRaw)
  // sanitize the HAST
  .use(rehypeSanitize, schema)
  // compile to a string
  .use(rehypeStringify);

const render = function(data) {
  if (Array.isArray(data)) {
    // Array
    return data.map(render);
  } else if (typeof data === 'string' || data instanceof String) {
    // String
    return parser.processSync(data).contents;
  } else if (typeof data === 'object' && data !== null) {
    // Object
    return Object.keys(data).reduce(function(result, key) {
      result[key] = render(data[key]);
      return result;
    }, {});
  } else {
    throw 'cannot render unknown data type: ' + typeof data;
  }
};

const main = function(filepaths) {
  filepaths.forEach(function(filepath) {
    const data = fs.readFileSync(filepath, 'utf8');

    if (path.extname(filepath) !== '.json') {
      throw 'cannot parse non-json file ' + filepath;
    }

    const rendered = render(JSON.parse(data));
    const dest =
      '/tmp/' + path.basename(filepath).replace('.json', '') + '.remark.json';

    console.log('writing to ' + dest);

    fs.writeFileSync(dest, JSON.stringify(rendered, null, 4));
  });
};

main(process.argv.slice(2));
