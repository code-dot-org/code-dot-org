const Parser = require('@code-dot-org/redactable-markdown/src/redactableMarkdownParser');

const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');
const rehypeSanitize = require('rehype-sanitize');
const rehypeStringify = require('rehype-stringify');
const defaultSanitizationSchema = require('hast-util-sanitize/lib/github.json');

const details = require('./templates/plugins/details');
const expandableImages = require('./templates/plugins/expandableImages');
const xmlAsTopLevelBlock = require('./templates/plugins/xmlAsTopLevelBlock');

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

// Add support for accesibility helpers
schema.attributes['*'].push('ariaHidden');

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

// CUSTOM RULES
schema.tagNames.push('iframe');
schema.attributes.iframe = ['src', 'allowfullscreen', 'frameborder'];

const markdownToHtml = Parser.create()
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
  .use(rehypeStringify);

const fs = require('fs');

const levels = JSON.parse(fs.readFileSync('/tmp/markdown.json'));

const result = {};
Object.keys(levels).forEach(levelName => {
  result[levelName] = markdownToHtml.processSync(levels[levelName]).contents;
});

console.log(JSON.stringify(result, null, 2));
