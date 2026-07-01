import {fireEvent, render as renderDom, screen} from '@testing-library/react';
import {renderToStaticMarkup} from 'react-dom/server';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {localization} from '@code-dot-org/core/plugins/localization';

import Markdown from '../components/Markdown';
import type {MarkdownExtension} from '../extension';
import {
  callout,
  clickableText,
  details,
  embeds,
  expandableImages,
  externalLinks,
  inlineStyles,
  lenientHeadings,
  visualCodeBlock,
  vocabularyDefinition,
} from '../extensions';
import {translateHtml} from '../localization';

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

    describe('inlineStyles restricts which properties survive', () => {
      it('keeps presentational properties but drops positioning/stacking', () => {
        const md =
          '<span style="color:red;position:fixed;top:0;z-index:99999">x</span>';
        const html = render(md, [inlineStyles]);
        expect(html).toContain('color:red');
        expect(html).not.toContain('position');
        expect(html).not.toContain('z-index');
        expect(html).not.toContain('top:');
      });

      it('keeps background-color but drops resource-loading background-image', () => {
        const md =
          '<span style="background-color:#eee;background-image:url(https://evil.example/t.gif)">x</span>';
        const html = render(md, [inlineStyles]);
        expect(html).toContain('background-color');
        expect(html).not.toContain('background-image');
        expect(html).not.toContain('evil.example');
        expect(html).not.toContain('url(');
      });

      it.each([
        '<span style="transform:scale(40)">x</span>',
        '<span style="opacity:0">x</span>',
        '<span style="cursor:pointer">x</span>',
        // a url() smuggled into an allowed property is still rejected by value
        '<span style="border-color:red;background-color:url(https://evil.example/t.gif)">x</span>',
        // hex-escape obfuscation of url(
        '<span style="background-color:\\75rl(https://evil.example/t.gif)">x</span>',
      ])('drops the unsafe declaration in %s', markdown => {
        const html = render(markdown, [inlineStyles]);
        expect(html).not.toContain('evil.example');
        expect(html).not.toContain('url(');
        expect(html).not.toContain('transform');
        expect(html).not.toContain('opacity');
        expect(html).not.toContain('cursor');
      });

      it('removes the style attribute entirely when nothing safe remains', () => {
        const md = '<span style="position:fixed;z-index:9">danger</span>';
        const html = render(md, [inlineStyles]);
        expect(html).not.toContain('style');
        expect(html).not.toContain('position');
        // the element and its text still render
        expect(html).toContain('danger');
      });

      it('does not end a declaration on a `;` inside a value', () => {
        const md =
          '<span style="font-family:&quot;a;b&quot;, sans-serif;color:red">x</span>';
        const html = render(md, [inlineStyles]);
        expect(html).toContain('color:red');
        expect(html).toContain('font-family');
      });
    });

    it('embeds permits iframes', () => {
      const md = '<iframe src="https://e.org" title="t"></iframe>';
      expect(render(md)).not.toContain('<iframe');
      const html = render(md, [embeds]);
      expect(html).toContain('<iframe');
      expect(html).toContain('src="https://e.org"');
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

    /*
     * `data-url` is a custom attribute the sanitizer's protocol allowlist never
     * vetted, so a dangerous-scheme url could otherwise reach the <img src> and,
     * worse, the onExpand callback a consumer may navigate to. The component
     * permits only http(s), relative references, and raster data:image URIs —
     * scriptable SVG data URIs and everything else are rejected.
     */
    describe('rejects unsafe data-url schemes', () => {
      it.each([
        '<span data-url="javascript:alert(1)">x</span>',
        '<span data-url="data:text/html,<script>alert(1)</script>">x</span>',
        '<span data-url="vbscript:msgbox(1)">x</span>',
        // an SVG data URI is inert in <img> but scriptable if navigated to
        '<span data-url="data:image/svg+xml,<svg onload=alert(1)></svg>">x</span>',
        // an obscured scheme: control characters a browser would strip
        '<span data-url="java\tscript:alert(1)">x</span>',
      ])('drops %s to plain text with no image or handler', markdown => {
        const onExpand = vi.fn();
        renderDom(
          <Markdown
            content={markdown}
            extensions={[expandableImages({onExpand})]}
          />,
        );
        expect(screen.queryByRole('img')).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
        expect(onExpand).not.toHaveBeenCalled();
        expect(screen.getByText('x')).toBeTruthy();
      });

      it('also drops an unsafe url from the ![alt expandable](url) syntax', () => {
        const onExpand = vi.fn();
        renderDom(
          <Markdown
            content="![cat expandable](javascript:alert(1))"
            extensions={[expandableImages({onExpand})]}
          />,
        );
        expect(screen.queryByRole('img')).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
      });
    });

    it.each([
      '<span data-url="/img/cat.png">cat</span>',
      '<span data-url="cat.png">cat</span>',
      '<span data-url="//cdn.example/cat.png">cat</span>',
      '<span data-url="HTTPS://img/cat.png">cat</span>',
      // raster data: image URIs are allowed (the demo uses one)
      '<span data-url="data:image/png;base64,iVBORw0KGgo=">cat</span>',
      '<span data-url="data:image/gif;base64,R0lGODdh">cat</span>',
    ])('keeps the safe url %s', markdown => {
      renderDom(
        <Markdown content={markdown} extensions={[expandableImages()]} />,
      );
      expect(screen.getByRole('img')).toBeTruthy();
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

  describe('vocabularyDefinition', () => {
    const lookup = (term: string) =>
      term === 'lossy compression'
        ? {definition: 'Reducing file size by discarding data.'}
        : undefined;

    it('resolves a known term to a definition tooltip', () => {
      const spy = vi.fn(lookup);
      const html = render('Use [v lossy compression] here.', [
        vocabularyDefinition({lookup: spy}),
      ]);
      expect(spy).toHaveBeenCalledWith('lossy compression');
      expect(html).toContain('title="Reducing file size by discarding data."');
      expect(html).toContain('lossy compression');
      expect(html).not.toContain('[v lossy compression]');
    });

    it('uses the provided display word when given', () => {
      const html = render('See [v lc].', [
        vocabularyDefinition({
          lookup: () => ({word: 'Lossy Compression', definition: 'def'}),
        }),
      ]);
      expect(html).toContain('Lossy Compression');
    });

    it('falls back to the bare term when unknown', () => {
      const html = render('An [v unknown term] here.', [
        vocabularyDefinition({lookup}),
      ]);
      expect(html).toContain('<span>unknown term</span>');
      expect(html).not.toContain('title=');
    });

    it('leaves the syntax literal when not enabled', () => {
      expect(render('Use [v lossy compression] here.')).toContain(
        '[v lossy compression]',
      );
    });

    it('does not resolve the syntax inside code', () => {
      const html = render('`[v lossy compression]`', [
        vocabularyDefinition({lookup}),
      ]);
      expect(html).toContain('[v lossy compression]');
      expect(html).not.toContain('title=');
    });
  });

  describe('lenientHeadings', () => {
    it('renders a heading when the space after the # is missing', () => {
      const html = render('###Build a sequence', [lenientHeadings]);
      expect(html).toContain('<h3');
      expect(html).toContain('Build a sequence');
      expect(html).not.toContain('###');
    });

    it('maps the number of #s to the heading level', () => {
      expect(render('#One', [lenientHeadings])).toContain('<h1');
      expect(render('####Four', [lenientHeadings])).toContain('<h4');
    });

    it('keeps following inline content, e.g. an icon (with inlineStyles)', () => {
      // The real curriculum shape: an icon immediately after the #s.
      const html = render('###<i class="fa-list-check"></i> Build a sequence', [
        lenientHeadings,
        inlineStyles,
      ]);
      expect(html).toContain('<h3');
      expect(html).toContain('fa-list-check');
      expect(html).toContain('Build a sequence');
    });

    it('leaves well-formed headings unchanged', () => {
      const html = render('### Spaced heading', [lenientHeadings]);
      expect(html).toContain('<h3');
      expect(html).toContain('Spaced heading');
    });

    it('leaves seven or more #s as a paragraph', () => {
      const html = render('#######Seven', [lenientHeadings]);
      expect(html).not.toMatch(/<h[1-6]/);
      expect(html).toContain('#######Seven');
    });

    it('does not touch #-prefixed lines inside a code block', () => {
      const html = render('```\n#include <stdio.h>\n```', [lenientHeadings]);
      expect(html).not.toMatch(/<h[1-6]/);
      expect(html).toContain('#include');
    });

    it('leaves the malformed heading as text when not enabled', () => {
      const html = render('###Build a sequence');
      expect(html).not.toContain('<h3');
      expect(html).toContain('###');
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

    it('hides a non-phrasing element from the translator and restores it', () => {
      // rehypeLocalize stashes anything outside its inline allowlist behind a
      // <code> placeholder the translator ignores, then restores it verbatim.
      const widget: MarkdownExtension = {
        name: 'widget',
        sanitizeSchema: {tagNames: ['widget']},
      };
      const seen = activateLocalization();
      const html = render('Press <widget></widget> now', [widget]);
      // the translator never saw the stashed element...
      expect(seen.join('')).not.toContain('<widget');
      // ...just a <code> placeholder (which the translator leaves untouched)
      expect(seen.join('')).toMatch(/<code[^>]*data-localize-token/);
      // ...but the output preserves the original
      expect(html).toContain('<widget');
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

    /*
     * rehypeLocalize round-trips each block through a live DOM (innerHTML) inside
     * the translator. Sanitization runs first, so the HTML the translator ever
     * sees is already stripped of dangerous attributes — nothing unsafe is
     * materialized in the DOM ahead of the sanitizer.
     */
    it('hands the translator only sanitized markup', () => {
      const seen = activateLocalization();
      render('<a href="javascript:alert(1)" onclick="steal()">x</a> and text');
      const handed = seen.join('');
      // the block did reach the translator (guards against a vacuous pass)...
      expect(handed).toContain('and text');
      // ...but stripped of the dangerous href/handler
      expect(handed).not.toContain('javascript:');
      expect(handed).not.toContain('onclick');
      expect(handed).not.toContain('steal');
    });

    /*
     * The translator's output is reparsed and spliced back into the tree, so a
     * hostile translation string must not smuggle in live markup. The second
     * sanitize pass (after localization) catches it.
     */
    it('sanitizes markup injected by the translator', () => {
      vi.spyOn(localization, 'isLocalizeJS').mockReturnValue(true);
      vi.spyOn(localization, 'translate').mockImplementation(input => {
        if (input && typeof input === 'object' && 'innerHTML' in input) {
          const element = input as unknown as HTMLElement;
          // An <iframe> is a sink rehype-react would render but the allowlist
          // (without the embeds extension) forbids — so it proves the post-
          // localization sanitize pass ran, independent of React's own scrubbing.
          element.innerHTML += '<iframe src="https://evil.example"></iframe>';
        }
        return input;
      });
      const html = render('hello');
      expect(html).not.toContain('<iframe');
      expect(html).not.toContain('evil.example');
    });
  });
});
