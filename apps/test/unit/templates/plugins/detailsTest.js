import Parser from '@code-dot-org/redactable-markdown';
import {assert} from '../../../util/deprecatedChai';

import details from '@cdo/apps/templates/plugins/details';

describe('details plugin', () => {
  const parser = Parser.create();
  parser.parser.use(details);

  it('can render', () => {
    const markdown =
      '::: details [summary-content]\n' +
      'contents, which are sometimes further block elements\n' +
      ':::';
    const expected =
      '<details><summary>summary-content</summary><p>contents, which are sometimes further block elements</p></details>\n';

    const rendered = parser.sourceToHtml(markdown);
    assert.equal(rendered, expected);
  });

  it('can have a variable number of opening colons', () => {
    const markdown =
      ':::::::: details [summary-content]\n' +
      'contents, which are sometimes further block elements\n' +
      ':::::::::::::';
    const expected =
      '<details><summary>summary-content</summary><p>contents, which are sometimes further block elements</p></details>\n';

    const rendered = parser.sourceToHtml(markdown);
    assert.equal(rendered, expected);
  });

  it('can render markdown syntax in the summary', () => {
    const markdown =
      '::: details [**summary** _content_]\n' +
      'contents, which are sometimes further block elements\n' +
      ':::';
    const expected =
      '<details><summary><strong>summary</strong> <em>content</em></summary><p>contents, which are sometimes further block elements</p></details>\n';

    const rendered = parser.sourceToHtml(markdown);
    assert.equal(rendered, expected);
  });

  it('can render markdown syntax in the body', () => {
    const markdown =
      '::: details [summary-content]\n' +
      '\n' +
      '# Contents\n' +
      '- can\n' +
      '- be\n' +
      '- markdown\n' +
      ':::';
    const expected =
      '<details><summary>summary-content</summary><h1>Contents</h1><ul>\n' +
      '<li>can</li>\n' +
      '<li>be</li>\n' +
      '<li>markdown</li>\n' +
      '</ul></details>\n';

    const rendered = parser.sourceToHtml(markdown);
    assert.equal(rendered, expected);
  });

  it('ignores trailing colons', () => {
    // Look how pretty this can be!
    const markdown =
      '::::::::::::: details [summary-content] :::::::::::::\n' +
      'contents, which are sometimes further block elements\n' +
      ':::::::::::::::::::::::::::::::::::::::::::::::::::::';
    const expected =
      '<details><summary>summary-content</summary><p>contents, which are sometimes further block elements</p></details>\n';

    const rendered = parser.sourceToHtml(markdown);
    assert.equal(rendered, expected);
  });

  it('ignores excess whitespace', () => {
    const markdown =
      ':::      details       [summary-content]          \n' +
      '\n' +
      'contents, which are sometimes further block elements\n' +
      '\n' +
      ':::';
    const expected =
      '<details><summary>summary-content</summary><p>contents, which are sometimes further block elements</p></details>\n';

    const rendered = parser.sourceToHtml(markdown);
    assert.equal(rendered, expected);
  });

  it('can nest', () => {
    const markdown =
      ':::: details [outer]\n' +
      '::: details [inner]\n' +
      'innermost content\n' +
      ':::\n' +
      '::::';
    const expected =
      '<details><summary>outer</summary><details><summary>inner</summary><p>innermost content</p></details></details>\n';

    const rendered = parser.sourceToHtml(markdown);
    assert.equal(rendered, expected);
  });

  it('requires a summary block', () => {
    const markdown =
      '::: details\n' +
      'contents, which are sometimes further block elements\n' +
      ':::';
    const expected =
      '<p>::: details\n' +
      'contents, which are sometimes further block elements\n' +
      ':::</p>\n';

    const rendered = parser.sourceToHtml(markdown);
    assert.equal(rendered, expected);
  });

  it('requires at least three opening colons', () => {
    const markdown =
      ':: details [summary-content]\n' +
      'contents, which are sometimes further block elements\n' +
      ':::';
    const expected =
      '<p>:: details [summary-content]\n' +
      'contents, which are sometimes further block elements\n' +
      ':::</p>\n';

    const rendered = parser.sourceToHtml(markdown);
    assert.equal(rendered, expected);
  });

  it('requires closing colons', () => {
    const markdown =
      '::: details [summary-content]\n' +
      'contents, which are sometimes further block elements\n';
    const expected =
      '<p>::: details [summary-content]\n' +
      'contents, which are sometimes further block elements</p>\n';

    const rendered = parser.sourceToHtml(markdown);
    assert.equal(rendered, expected);
  });

  it('can redact', () => {
    const markdown =
      '::: details [summary-content]\n' +
      'contents, which are sometimes further block elements\n' +
      ':::';
    const expected =
      '[summary-content][0]\n' +
      '\n' +
      'contents, which are sometimes further block elements\n' +
      '\n' +
      '[/][0]\n';

    const rendered = parser.sourceToRedacted(markdown);
    assert.equal(rendered, expected);
  });

  it('can redact nested', () => {
    const markdown =
      ':::: details [outer]\n' +
      '::: details [inner]\n' +
      'innermost content\n' +
      ':::\n' +
      '::::';
    const expected =
      '[outer][0]\n' +
      '\n' +
      '[inner][1]\n' +
      '\n' +
      'innermost content\n' +
      '\n' +
      '[/][1]\n' +
      '\n' +
      '[/][0]\n';

    const rendered = parser.sourceToRedacted(markdown);
    assert.equal(rendered, expected);
  });

  it('can restore', () => {
    const original =
      '::: details [summary-content]\n' +
      'contents, which are sometimes further block elements\n' +
      ':::';
    const translated =
      '[contenu sommaire][0]\n' +
      '\n' +
      'contenu, qui sont parfois des éléments de bloc supplémentaires\n' +
      '\n' +
      '[/][0]\n';
    const expected =
      '::: details [contenu sommaire]\n' +
      '\n' +
      'contenu, qui sont parfois des éléments de bloc supplémentaires\n' +
      '\n' +
      ':::\n';
    const restored = parser.sourceAndRedactedToMarkdown(original, translated);
    assert.equal(restored, expected);
  });

  it('can restore nested', () => {
    const original =
      ':::: details [outer]\n' +
      '::: details [inner]\n' +
      'innermost content\n' +
      ':::\n' +
      '::::';
    const translated =
      '[extérieur][0]\n' +
      '\n' +
      '[interne][1]\n' +
      '\n' +
      'contenu le plus profond\n' +
      '\n' +
      '[/][1]\n' +
      '\n' +
      '[/][0]\n';
    // Note the relative colon counts are preserved
    const expected =
      ':::: details [extérieur]\n' +
      '\n' +
      '::: details [interne]\n' +
      '\n' +
      'contenu le plus profond\n' +
      '\n' +
      ':::\n' +
      '\n' +
      '::::\n';
    const restored = parser.sourceAndRedactedToMarkdown(original, translated);
    assert.equal(restored, expected);
  });
});
