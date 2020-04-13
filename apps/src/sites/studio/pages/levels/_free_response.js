import $ from 'jquery';
import Parser from '@code-dot-org/redactable-markdown';
import defaultSanitizationSchema from 'hast-util-sanitize/lib/github.json';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import rehypeParse from 'rehype-parse';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkRehype from 'remark-rehype';

// In preparation for switching FreeResponse levels over to use the
// SafeMarkdown renderer, compare clientside-rendered markdown against
// serverside-rendered markdown. Disparities will be logged to firehose so
// markdown can be updated to work on both renderers, and the eventual
// switchover will be guaranteed to be seamless.
$(document).ready(() => {
  // schema and parsing logic is copied from SafeMarkdown; this test is
  // intended to run for only a short while, so I'm being lazy and copying
  // rather than rebuilding the sanitization schema to be importable.
  const schema = Object.assign({}, defaultSanitizationSchema);
  schema.attributes.img.push('height', 'width');
  schema.tagNames.push('span');
  schema.attributes.span = ['dataUrl', 'className'];
  schema.attributes['*'].push('style', 'className');
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

  const markdownToHtml = Parser.create()
    .getParser()
    .use(remarkRehype, {
      allowDangerousHTML: true
    })
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify);

  const htmlNormalize = Parser.create()
    .getParser()
    .use(rehypeParse, {fragment: true})
    .use(rehypeStringify);

  $('.free-response > .markdown-container').each(function() {
    const container = this;
    if (!container.dataset.markdown) {
      return;
    }

    // render the markdown with remark
    const clientside = markdownToHtml.processSync(container.dataset.markdown)
      .contents;
    // normalize the HTML, to prevent false positives
    const serverside = htmlNormalize.processSync(
      $('.free-response > .serverside-render').html()
    ).contents;

    // ignore whitespace, again to prevent false positives
    if (clientside.replace(/\s/g, '') !== serverside.replace(/\s/g, '')) {
      firehoseClient.putRecord({
        study: 'FreeResponse-rendering',
        study_group: '',
        event: 'mismatch',
        data_string: document.URL,
        data_json: JSON.stringify({
          serverside,
          clientside
        })
      });
    }
  });
});
