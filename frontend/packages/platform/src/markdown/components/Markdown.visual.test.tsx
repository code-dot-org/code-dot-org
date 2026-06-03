import {cleanup, render} from '@testing-library/react';
import type {ReactNode} from 'react';
import {page} from 'vitest/browser';
import {afterEach, describe, expect, it} from 'vitest';

import {
  blockly,
  callout,
  clickableText,
  details,
  embeds,
  expandableImages,
  externalLinks,
  inlineStyles,
  visualCodeBlock,
  vocabularyDefinition,
} from '../extensions';

import Markdown from './Markdown';

afterEach(cleanup);

// Inline data-URI image so the expandable-image scenario is network-free and
// deterministic.
const IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' " +
  "height='64'%3E%3Crect width='96' height='64' fill='%234a90d9'/%3E%3C/svg%3E";

const VOCAB: Record<string, {definition: string}> = {
  'lossy compression': {definition: 'Reducing file size by discarding data.'},
  algorithm: {definition: 'A list of steps to finish a task.'},
};

// Render a scenario into a fixed-width white frame and screenshot it.
const snapshot = async (name: string, ui: ReactNode): Promise<void> => {
  render(
    <div
      data-testid="scene"
      style={{
        background: '#fff',
        fontFamily: 'sans-serif',
        padding: 16,
        width: 600,
      }}
    >
      {ui}
    </div>,
  );
  await expect.element(page.getByTestId('scene')).toMatchScreenshot(name);
};

describe('Markdown visuals', () => {
  it('basic', () =>
    snapshot(
      'basic',
      <Markdown
        content={
          '# Heading 1\n\n## Heading 2\n\n' +
          'A paragraph with **bold**, *italic*, `inline code`, and a ' +
          '[link to code.org](https://code.org).\n\n' +
          '- list item one\n- list item two\n\n' +
          '| Feature | Supported |\n| ------- | --------- |\n' +
          '| Tables  | yes       |\n| Links   | yes       |\n'
        }
      />,
    ));

  it('sanitization', () =>
    snapshot(
      'sanitization',
      <Markdown
        content={
          'This text is safe. <script>alert("xss")</script>' +
          '<img src="x" onerror="alert(1)" /> The script and handler are stripped.'
        }
      />,
    ));

  it('callout', () =>
    snapshot(
      'callout',
      <Markdown
        content={'<callout variant="tip">\nHeads up — a callout.\n</callout>'}
        extensions={[callout]}
      />,
    ));

  it('inline styles', () =>
    snapshot(
      'inline-styles',
      <Markdown
        content={
          'A <span style="color:red; font-weight:bold">styled</span> span.'
        }
        extensions={[inlineStyles]}
      />,
    ));

  it('embeds', () =>
    snapshot(
      'embeds',
      <Markdown
        content={
          '<iframe src="data:text/html,embed" title="Example" width="320" height="120"></iframe>'
        }
        extensions={[embeds]}
      />,
    ));

  it('blockly', () =>
    snapshot(
      'blockly',
      <Markdown
        content={
          'Drag this block: <xml><block type="text_print"><title name="TEXT">hello</title></block></xml>'
        }
        extensions={[blockly]}
      />,
    ));

  it('external links', () =>
    snapshot(
      'external-links',
      <Markdown
        content={'An [external link](https://example.com) opens in a new tab.'}
        extensions={[externalLinks()]}
      />,
    ));

  it('details', () =>
    snapshot(
      'details',
      <Markdown
        content={'::: details [**Show a hint**]\nThe answer is *42*.\n:::'}
        extensions={[details]}
      />,
    ));

  it('visual code blocks', () =>
    snapshot(
      'visual-code-blocks',
      <Markdown
        content={'First `playSound()`(#fff176), then `get nectar`(#00b0bd).'}
        extensions={[visualCodeBlock]}
      />,
    ));

  it('vocabulary definitions', () =>
    snapshot(
      'vocabulary-definitions',
      <Markdown
        content={
          'A method like [v lossy compression] follows an [v algorithm]. ' +
          'An [v unknown term] falls back to plain text.'
        }
        extensions={[vocabularyDefinition({lookup: term => VOCAB[term]})]}
      />,
    ));

  it('clickable text', () =>
    snapshot(
      'clickable-text',
      <Markdown
        content={'Now [run your program](#clickable=run) to see the result.'}
        extensions={[clickableText({onActivate: () => {}})]}
      />,
    ));

  it('expandable images', () =>
    snapshot(
      'expandable-images',
      <Markdown
        content={`![A blue box expandable](${IMAGE})`}
        extensions={[expandableImages({onExpand: () => {}})]}
      />,
    ));
});
