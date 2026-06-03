import {fireEvent, render as renderDom, screen} from '@testing-library/react';
import {renderToStaticMarkup} from 'react-dom/server';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {localization} from '@code-dot-org/core/plugins/localization';

import type {MarkdownExtension} from '../extension';
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
} from '../extensions';
import {translateHtml} from '../localization';

import Markdown from './Markdown';

/*
 * Make the core localization plugin look loaded, with a translate that
 * uppercases text nodes (preserving structure). Returns the list of HTML
 * fragments the translator was handed, so tests can assert what was concealed.
 */
const activateLocalization = (): string[] => {
  const seen: string[] = [];
  vi.spyOn(localization, 'isLocalizeJS').mockReturnValue(true);
  vi.spyOn(localization, 'translate').mockImplementation(input => {
    if (input && typeof input === 'object' && 'childNodes' in input) {
      const element = input as unknown as HTMLElement;
      seen.push(element.innerHTML);
      const walk = (node: Node) => {
        if (node.nodeType === 3) {
          node.textContent = (node.textContent ?? '').toUpperCase();
        }
        node.childNodes.forEach(walk);
      };
      walk(element);
    }
    return input;
  });
  return seen;
};

const render = (markdown: string, extensions?: MarkdownExtension[]) =>
  renderToStaticMarkup(<Markdown content={markdown} extensions={extensions} />);

// Minimal tree node shared by the trivial inline plugins below.
interface TreeNode {
  type: string;
  value?: string;
  children?: TreeNode[];
}

describe('Markdown', () => {
  it('renders basic markdown', () => {
    const html = render('# Title\n\nHello **world**.');
    expect(html).toContain('Title');
    expect(html).toContain('<h1');
    expect(html).toContain('<strong');
    expect(html).toContain('>world</strong>');
  });

  it('reads from children when content is absent', () => {
    const html = renderToStaticMarkup(<Markdown>{'plain text'}</Markdown>);
    expect(html).toContain('plain text');
  });

  describe('localization wrappers', () => {
    it('isolates paragraphs for translation', () => {
      const html = render('a paragraph');
      expect(html).toContain('data-isolate="true"');
    });

    it('marks links for url localization', () => {
      const html = render('[code.org](https://code.org)');
      expect(html).toContain('data-lz-url="true"');
      expect(html).toContain('data-localize="markdown-url"');
      expect(html).toContain('href="https://code.org"');
    });
  });

  describe('sanitization', () => {
    it('strips script tags', () => {
      const html = render('hi <script>alert(1)</script> there');
      expect(html).not.toContain('<script');
      expect(html).not.toContain('alert(1)');
    });

    it('strips event-handler attributes', () => {
      const html = render('<img src="x" onerror="alert(1)" />');
      expect(html).not.toContain('onerror');
    });

    it('strips javascript: urls', () => {
      const html = render('[click](javascript:alert(1))');
      expect(html).not.toContain('javascript:');
    });
  });

  describe('extensions', () => {
    it('strips an extension element when the extension is not enabled', () => {
      const html = render('<callout variant="tip">heads up</callout>');
      expect(html).not.toContain('<aside');
      expect(html).not.toContain('data-variant');
      // sanitization drops the unknown element but keeps its text content
      expect(html).toContain('heads up');
    });

    it('renders an extension element only when enabled', () => {
      // opening tag on its own line so the block-level callout is not wrapped
      // in a paragraph (an <aside> cannot nest in a <p>)
      const html = render('<callout variant="tip">\nheads up\n</callout>', [
        callout,
      ]);
      expect(html).toContain('<aside');
      expect(html).toContain('data-variant="tip"');
      expect(html).toContain('heads up');
      // the aside is not nested inside a paragraph
      expect(html).not.toMatch(/<p[^>]*>\s*<aside/);
    });

    it('runs extension remark plugins (markdown syntax stage)', () => {
      const shout: MarkdownExtension = {
        name: 'shout',
        remarkPlugins: [
          () => (tree: TreeNode) => {
            const walk = (node: TreeNode) => {
              if (node.type === 'text' && node.value) {
                node.value = node.value.toUpperCase();
              }
              node.children?.forEach(walk);
            };
            walk(tree);
          },
        ],
      };
      expect(render('hello', [shout])).toContain('HELLO');
      // ...and is inert when not enabled
      expect(render('hello')).not.toContain('HELLO');
    });

    it('runs extension rehype plugins (html tree stage)', () => {
      const tag: MarkdownExtension = {
        name: 'tag',
        rehypePlugins: [
          () => (tree: TreeNode) => {
            tree.children = [
              ...(tree.children ?? []),
              {type: 'text', value: ' [rehype-ran]'},
            ];
          },
        ],
      };
      expect(render('content', [tag])).toContain('[rehype-ran]');
    });

    it('layers multiple extensions together', () => {
      const html = render('<callout>\nnote\n</callout>\n\nbody', [callout]);
      expect(html).toContain('<aside');
      // base behavior (paragraph localization) still applies to the body
      expect(html).toContain('data-isolate="true"');
    });
  });

  describe('legacy schema allowances', () => {
    it('inlineStyles permits style attributes', () => {
      const md = '<span style="color:red">x</span>';
      expect(render(md)).not.toContain('color');
      expect(render(md, [inlineStyles])).toContain('color:red');
    });

    it('embeds permits iframes', () => {
      const md = '<iframe src="https://e.org" title="t"></iframe>';
      expect(render(md)).not.toContain('<iframe');
      const html = render(md, [embeds]);
      expect(html).toContain('<iframe');
      expect(html).toContain('src="https://e.org"');
    });

    it('blockly permits xml/block tags and preserves ids', () => {
      const md = '<xml><block type="foo" id="bar"></block></xml>';
      const without = render(md);
      expect(without).not.toContain('<xml');
      expect(without).not.toContain('<block');

      const html = render(md, [blockly]);
      expect(html).toContain('<xml');
      expect(html).toContain('<block');
      // clobberPrefix cleared: the id is not rewritten to user-content-bar
      expect(html).toContain('id="bar"');
      expect(html).not.toContain('user-content-');
    });
  });

  describe('clickableText (interactive)', () => {
    const md = '<b data-id="play">Go</b>';

    it('activates with the id on click', () => {
      const onActivate = vi.fn();
      renderDom(
        <Markdown content={md} extensions={[clickableText({onActivate})]} />,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Go'}));
      expect(onActivate).toHaveBeenCalledWith('play');
    });

    it('activates on Enter and Space', () => {
      const onActivate = vi.fn();
      renderDom(
        <Markdown content={md} extensions={[clickableText({onActivate})]} />,
      );
      const button = screen.getByRole('button', {name: 'Go'});
      fireEvent.keyDown(button, {key: 'Enter'});
      fireEvent.keyDown(button, {key: ' '});
      expect(onActivate).toHaveBeenCalledTimes(2);
    });

    it('renders plain bold when no handler is supplied', () => {
      renderDom(<Markdown content={md} extensions={[clickableText()]} />);
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.getByText('Go').tagName).toBe('B');
    });

    it('supports the [label](#clickable=id) markdown syntax', () => {
      const onActivate = vi.fn();
      renderDom(
        <Markdown
          content="press [Go](#clickable=play) now"
          extensions={[clickableText({onActivate})]}
        />,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Go'}));
      expect(onActivate).toHaveBeenCalledWith('play');
    });

    it('leaves ordinary links alone', () => {
      renderDom(
        <Markdown
          content="[home](https://code.org)"
          extensions={[clickableText({onActivate: vi.fn()})]}
        />,
      );
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.getByRole('link', {name: 'home'})).toBeTruthy();
    });
  });

  describe('expandableImages (interactive)', () => {
    const md = '<span data-url="https://img/cat.png">A cat</span>';

    it('expands with url and alt on click', () => {
      const onExpand = vi.fn();
      renderDom(
        <Markdown content={md} extensions={[expandableImages({onExpand})]} />,
      );
      fireEvent.click(screen.getByRole('button', {name: /A cat/}));
      expect(onExpand).toHaveBeenCalledWith('https://img/cat.png', 'A cat');
    });

    it('renders the image with the span text as alt', () => {
      const onExpand = vi.fn();
      renderDom(
        <Markdown content={md} extensions={[expandableImages({onExpand})]} />,
      );
      const image = screen.getByRole('img', {name: 'A cat'});
      expect(image.getAttribute('src')).toBe('https://img/cat.png');
    });

    it('renders a non-interactive image when no handler is supplied', () => {
      renderDom(<Markdown content={md} extensions={[expandableImages()]} />);
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.getByRole('img').getAttribute('src')).toBe(
        'https://img/cat.png',
      );
    });

    it('supports the ![alt expandable](url) markdown syntax', () => {
      const onExpand = vi.fn();
      renderDom(
        <Markdown
          content="![A cat expandable](https://img/cat.png)"
          extensions={[expandableImages({onExpand})]}
        />,
      );
      fireEvent.click(screen.getByRole('button', {name: /A cat/}));
      expect(onExpand).toHaveBeenCalledWith('https://img/cat.png', 'A cat');
      expect(screen.getByRole('img').getAttribute('alt')).toBe('A cat');
    });

    it('leaves ordinary images alone', () => {
      renderDom(
        <Markdown
          content="![just a cat](https://img/cat.png)"
          extensions={[expandableImages({onExpand: vi.fn()})]}
        />,
      );
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.getByRole('img', {name: 'just a cat'})).toBeTruthy();
    });
  });

  describe('details', () => {
    const block = ['::: details [**Hint**]', 'Body text.', ':::'].join('\n');

    it('renders the ::: details sugar as a disclosure', () => {
      const html = render(block, [details]);
      expect(html).toContain('<details');
      expect(html).toContain('<summary>');
      // markdown in the summary is parsed, and the summary stays inline (no <p>)
      expect(html).toContain('<strong');
      expect(html).toContain('Hint');
      expect(html).not.toMatch(/<summary>\s*<p/);
      expect(html).toContain('Body text.');
      // the fence markers are consumed
      expect(html).not.toContain(':::');
    });

    it('accepts the no-space spelling (:::details [x])', () => {
      const html = render(':::details [Hi]\nBody.\n:::', [details]);
      expect(html).toContain('<details');
      expect(html).toContain('Hi');
    });

    it('leaves the syntax as literal text when not enabled', () => {
      const html = render(block);
      expect(html).not.toContain('<details');
      expect(html).toContain(':::');
    });
  });

  describe('externalLinks', () => {
    const md = '[code.org](https://code.org)';

    it('opens links in a new tab when enabled', () => {
      const html = render(md, [externalLinks()]);
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });

    it('does not open links in a new tab by default', () => {
      const html = render(md);
      expect(html).not.toContain('target="_blank"');
    });

    it('scopes to external hrefs when given a predicate', () => {
      const isExternal = (href: string) => !href.includes('code.org');
      expect(render(md, [externalLinks({isExternal})])).not.toContain(
        'target="_blank"',
      );
      expect(
        render('[ex](https://example.com)', [externalLinks({isExternal})]),
      ).toContain('target="_blank"');
    });
  });

  describe('visualCodeBlock', () => {
    const md = '`playSound()`(#fff176)';

    it('renders a colored code block from the syntax', () => {
      const html = render(md, [visualCodeBlock]);
      expect(html).toContain('<code');
      expect(html).toContain('playSound()');
      expect(html).toContain('background-color:#fff176');
      // the (#hex) marker is consumed, not left as text
      expect(html).not.toContain('(#fff176)');
    });

    it('leaves the syntax as literal text when not enabled', () => {
      const html = render(md);
      expect(html).toContain('playSound()');
      expect(html).toContain('(#fff176)');
      expect(html).not.toContain('background-color');
    });

    it('does not color plain inline code', () => {
      const html = render('plain `code` here', [visualCodeBlock]);
      expect(html).toContain('<code');
      expect(html).not.toContain('background-color');
    });
  });

  describe('localization', () => {
    afterEach(() => vi.restoreAllMocks());

    it('uses the runtime data-isolate path when LocalizeJS is not loaded', () => {
      // core reports inactive in the test environment
      const html = render('hello world');
      expect(html).toContain('data-isolate="true"');
      expect(html).not.toContain('data-notranslate');
    });

    it('translateHtml is a no-op while inactive', () => {
      expect(translateHtml('<b>hi</b>')).toBe('<b>hi</b>');
    });

    it('translates text and marks the paragraph data-notranslate when active', () => {
      activateLocalization();
      const html = render('hello world');
      expect(html).toContain('HELLO WORLD');
      expect(html).toContain('data-notranslate="true"');
      expect(html).not.toContain('data-isolate');
    });

    it('hides Blockly XML from the translator and restores it verbatim', () => {
      const seen = activateLocalization();
      const html = render(
        'Press <xml><block type="foo" id="bar"></block></xml> now',
        [blockly],
      );
      // the translator never saw the raw Blockly tags...
      expect(seen.join('')).not.toContain('<xml');
      expect(seen.join('')).not.toContain('<block');
      // ...just a <code> placeholder (which the translator leaves untouched)
      expect(seen.join('')).toMatch(/<code[^>]*data-localize-token/);
      // ...but the output preserves the originals, ids intact
      expect(html).toContain('<xml');
      expect(html).toContain('<block');
      expect(html).toContain('id="bar"');
    });

    it('renames <code> for translation and restores it', () => {
      const seen = activateLocalization();
      const html = render('run `print` please');
      expect(seen.join('')).not.toContain('<code');
      expect(seen.join('')).toContain('data-localize-rename');
      expect(html).toContain('<code');
    });

    it('preserves inline formatting through translation', () => {
      activateLocalization();
      const html = render('a **bold** and [link](https://code.org)');
      expect(html).toContain('<strong');
      expect(html).toContain('href="https://code.org"');
    });
  });
});
