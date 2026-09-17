import {
  fireEvent,
  render as renderDom,
  screen,
  waitFor,
} from '@testing-library/react';
import {renderToStaticMarkup} from 'react-dom/server';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {ThemeProvider} from '@mui/material/styles';

import {CdoTheme} from '@code-dot-org/component-library/themes';
import {localization} from '@code-dot-org/core/plugins/localization';

import Markdown, {type MarkdownProps} from '../components/Markdown';
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
  lenientLinkDestinations,
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

  it('renders --- as a design-system divider', () => {
    const html = render('above\n\n---\n\nbelow');
    // The DSCO Divider renders an <hr> carrying its (hashed) module class.
    expect(html).toMatch(/<hr[^>]*class="[^"]*divider/);
  });

  /*
   * A tight list (`- one`, no blank line between items) and a raw HTML `<li>`
   * both hold their text directly, with no paragraph of their own. The
   * paragraph is what carries the body type scale and the translation
   * isolation, so the pipeline inserts one; see rehypeListItemParagraphs.
   */
  describe('bodyVariant', () => {
    const renderWith = (
      markdown: string,
      bodyVariant: MarkdownProps['bodyVariant'],
    ) =>
      renderToStaticMarkup(
        <Markdown content={markdown} bodyVariant={bodyVariant} />,
      );

    it('renders paragraphs as body2 by default', () => {
      expect(render('a paragraph')).toContain('MuiTypography-body2');
    });

    it('renders paragraphs in the requested variant', () => {
      const html = renderWith('a paragraph', 'body3');
      expect(html).toContain('MuiTypography-body3');
      expect(html).not.toContain('MuiTypography-body2');
    });

    it('applies to list item paragraphs too', () => {
      const html = renderWith('- one\n- two', 'body4');
      expect(html.match(/<p[^>]*MuiTypography-body4/g)).toHaveLength(2);
    });

    it('sizes links to match the body text', () => {
      // The design system sizes Link by component size, not by typography
      // variant, so a body4 paragraph needs an xs link to match.
      const html = renderWith('a [link](https://example.com) here', 'body4');
      expect(html).toContain('link-xs');
      expect(html).not.toContain('link-m');
    });

    it('sizes links as medium by default', () => {
      expect(render('a [link](https://example.com) here')).toContain('link-m');
    });

    it('leaves headings and inline variants alone', () => {
      const html = renderWith('# Title\n\nSome **bold** text.', 'body4');
      expect(html).toContain('MuiTypography-h1');
      expect(html).toContain('MuiTypography-strong');
      expect(html).toContain('MuiTypography-body4');
    });

    it('keeps the paragraph a <p> carrying its localization marker', () => {
      const html = renderWith('a paragraph', 'body3');
      expect(html).toMatch(/<p[^>]*data-isolate="true"/);
    });

    it('still lets an extension override the paragraph mapping', () => {
      const html = renderToStaticMarkup(
        <Markdown
          content={'a paragraph'}
          bodyVariant="body3"
          extensions={[
            {
              name: 'plainParagraphs',
              components: {
                p: ({children}) => <p className="mine">{children}</p>,
              },
            },
          ]}
        />,
      );
      expect(html).toContain('class="mine"');
      expect(html).not.toContain('MuiTypography-body3');
    });

    it('rebuilds the processor when the variant changes', () => {
      const {container, rerender} = renderDom(
        <Markdown content="a paragraph" bodyVariant="body3" />,
      );
      expect(container.querySelector('p')?.className).toContain(
        'MuiTypography-body3',
      );

      rerender(<Markdown content="a paragraph" bodyVariant="body4" />);
      expect(container.querySelector('p')?.className).toContain(
        'MuiTypography-body4',
      );
    });
  });

  describe('inline', () => {
    const renderInline = (markdown: string) =>
      renderToStaticMarkup(<Markdown content={markdown} inline />);

    it('renders one span, with no block wrapper or paragraph', () => {
      const html = renderInline('**Algorithm** - a list of steps');
      expect(html).not.toContain('<div');
      expect(html).not.toContain('<p');
      expect(html).toMatch(/^<span[^>]*>/);
      // Inline mappings still apply: strong is the design-system variant.
      expect(html).toMatch(/<strong[^>]*MuiTypography-strong[^>]*>Algorithm</);
    });

    it('still maps links to the design-system component', () => {
      const html = renderInline('see [the docs](https://example.com)');
      expect(html).toContain('href="https://example.com"');
      expect(html).toContain('link-m');
    });

    it('keeps the localization marker the paragraph would have carried', () => {
      expect(renderInline('some text')).toMatch(
        /<span[^>]*data-isolate="true"/,
      );
    });

    it('leaves block syntax as literal text', () => {
      // A definition that happens to start with "- " must not become a list
      // inside an inline context.
      for (const [markdown, literal] of [
        ['- one\n- two', '- one'],
        ['# not a heading', '# not a heading'],
        ['> not a quote', '&gt; not a quote'],
        ['---', '---'],
      ]) {
        const html = renderInline(markdown);
        expect(html).toContain(literal);
        expect(html).not.toMatch(/<(ul|ol|li|h1|blockquote|hr)\b/);
      }
    });

    it('applies the className to the span', () => {
      const html = renderToStaticMarkup(
        <Markdown content="text" inline className="mine" />,
      );
      expect(html).toMatch(/<span[^>]*class="mine"/);
    });

    it('still wraps in a block container when not inline', () => {
      const html = render('**Algorithm** - a list of steps');
      expect(html).toContain('<div');
      expect(html).toContain('<p');
    });
  });

  describe('list items', () => {
    it('wraps tight list item text in a body paragraph', () => {
      const html = render('- one\n- two');
      expect(html.match(/<p[^>]*MuiTypography-body2/g)).toHaveLength(2);
    });

    it('wraps raw HTML list item text in a body paragraph', () => {
      const html = render('<ul>\n<li>an item</li>\n</ul>');
      expect(html).toMatch(
        /<li><p[^>]*MuiTypography-body2[^>]*>an item<\/p><\/li>/,
      );
    });

    it('leaves a loose list item with the one paragraph it already had', () => {
      const html = render('- one\n\n- two');
      expect(html.match(/<p[^>]*MuiTypography-body2/g)).toHaveLength(2);
    });

    it('keeps a nested list beside the paragraph, not inside it', () => {
      const {container} = renderDom(
        <Markdown content={'- outer\n  - inner'} />,
      );
      expect(container.querySelectorAll('li > p')).toHaveLength(2);
      expect(container.querySelector('li > ul')).not.toBeNull();
      expect(container.querySelector('p ul')).toBeNull();
    });

    it('does not wrap block content in a list item', () => {
      const html = render('- ### a heading');
      expect(html).toContain('<h3');
      expect(html).not.toMatch(/<p[^>]*>\s*<h3/);
    });
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

    /*
     * A mapped element keeps only the props its component forwards, so an
     * allowed `style` reaches the page only if the mapping passes it on. One
     * case per element the base mappings claim.
     */
    it.each([
      ['p', '<p style="color:red">x</p>', 'color:red'],
      ['strong', '<strong style="color:red">x</strong>', 'color:red'],
      ['em', '<em style="color:red">x</em>', 'color:red'],
      ['h2', '<h2 style="color:red">x</h2>', 'color:red'],
      ['a', '<a style="color:red" href="https://code.org">x</a>', 'color:red'],
      // `clear:both` after a floated image is the overwhelmingly common
      // styled <hr> in our curriculum.
      ['hr', '<hr style="clear:both">', 'clear:both'],
    ])('inlineStyles survives the %s mapping', (_tag, md, expected) => {
      expect(render(md, [inlineStyles])).toContain(expected);
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

    /*
     * The component is registered for every <span>, so the option must reach the
     * expandable images and nothing else.
     */
    describe('className option', () => {
      it('applies it to the button, alongside the author class', () => {
        renderDom(
          <Markdown
            content='<span class="author" data-url="https://img/cat.png">A cat</span>'
            extensions={[
              expandableImages({onExpand: vi.fn(), className: 'from-option'}),
            ]}
          />,
        );
        const button = screen.getByRole('button', {name: /A cat/});
        expect(button.className).toContain('from-option');
        expect(button.className).toContain('author');
      });

      it('applies it to the wrapping span when no handler is supplied', () => {
        renderDom(
          <Markdown
            content={md}
            extensions={[expandableImages({className: 'from-option'})]}
          />,
        );
        const wrapper = screen.getByRole('img').parentElement;
        expect(wrapper?.tagName).toBe('SPAN');
        expect(wrapper?.className).toContain('from-option');
      });

      it('leaves a span that is not an expandable image untouched', () => {
        renderDom(
          <Markdown
            content='<span class="author">plain</span>'
            extensions={[
              expandableImages({onExpand: vi.fn(), className: 'from-option'}),
            ]}
          />,
        );
        const span = screen.getByText('plain');
        expect(span.className).toBe('author');
      });
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

    /*
     * Legacy curriculum colors a code block with a raw inline style rather than
     * the (#rrggbb) syntax. This extension owns the `code` mapping, so it renders
     * those too; enabling it must not strip what inlineStyles allowed through.
     */
    it('keeps an inline style on raw <code> when inlineStyles is enabled', () => {
      const html = render(
        'Press <code style="background-color:#6af36c">up</code> now',
        [inlineStyles, visualCodeBlock],
      );
      expect(html).toContain('background-color:#6af36c');
    });
  });

  describe('vocabularyDefinition', () => {
    const lookup = (term: string) =>
      term === 'lossy compression'
        ? {definition: 'Reducing file size by discarding data.'}
        : undefined;

    it('resolves a known term, consuming the syntax', () => {
      const spy = vi.fn(lookup);
      const html = render('Use [v lossy compression] here.', [
        vocabularyDefinition({lookup: spy}),
      ]);
      expect(spy).toHaveBeenCalledWith('lossy compression');
      expect(html).toContain('lossy compression');
      expect(html).not.toContain('[v lossy compression]');
    });

    it('shows the definition in a tooltip on hover', async () => {
      renderDom(
        <Markdown
          content={'Use [v lossy compression] here.'}
          extensions={[vocabularyDefinition({lookup})]}
        />,
      );

      fireEvent.mouseOver(screen.getByText('lossy compression'));

      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip.textContent).toBe(
        'Reducing file size by discarding data.',
      );
    });

    it('makes the term keyboard-reachable and shows the definition on focus', async () => {
      renderDom(
        <Markdown
          content={'Use [v lossy compression] here.'}
          extensions={[vocabularyDefinition({lookup})]}
        />,
      );

      // A tab stop, not a control: there is nothing here to activate.
      const term = screen.getByText('lossy compression');
      expect(term.getAttribute('tabindex')).toBe('0');

      term.focus();
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip.textContent).toBe(
        'Reducing file size by discarding data.',
      );
    });

    it('ties the definition to the term with aria-describedby under the theme', async () => {
      // CdoTheme sets describeChild, so the definition describes the term
      // rather than renaming it. apps renders every root inside this theme.
      renderDom(
        <ThemeProvider theme={CdoTheme}>
          <Markdown
            content={'Use [v lossy compression] here.'}
            extensions={[vocabularyDefinition({lookup})]}
          />
        </ThemeProvider>,
      );

      const term = screen.getByText('lossy compression');
      term.focus();

      const tooltip = await screen.findByRole('tooltip');
      expect(term.getAttribute('aria-describedby')).toBe(tooltip.id);
      expect(term.getAttribute('aria-label')).toBeNull();
    });

    it('dismisses the tooltip on Escape', async () => {
      renderDom(
        <Markdown
          content={'Use [v lossy compression] here.'}
          extensions={[vocabularyDefinition({lookup})]}
        />,
      );

      const term = screen.getByText('lossy compression');
      fireEvent.mouseOver(term);
      await screen.findByRole('tooltip');

      // SC 1.4.13: content shown on hover must be dismissible without moving
      // the pointer.
      fireEvent.keyDown(document.body, {key: 'Escape'});
      await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
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
      // Plain text: no trigger, so no tab stop and nothing to describe.
      expect(html).toContain('<span>unknown term</span>');
      expect(html).not.toContain('tabindex');
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
      expect(html).not.toContain('tabindex');
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

  describe('lenientLinkDestinations', () => {
    // The real curriculum shape: an images.code.org asset whose uploaded
    // filename contains spaces. 171 of these across 80 units at last count.
    const cupStack =
      '![](https://images.code.org/9b0af665c700-cup stack ideas.png)';

    it('renders an image whose destination contains spaces', () => {
      const html = render(cupStack, [lenientLinkDestinations]);
      expect(html).toContain(
        '<img src="https://images.code.org/9b0af665c700-cup%20stack%20ideas.png"',
      );
    });

    it('renders a link whose destination contains spaces', () => {
      const html = render('[go](https://example.com/my page)', [
        lenientLinkDestinations,
      ]);
      expect(html).toContain('href="https://example.com/my%20page"');
      expect(html).toContain('go');
    });

    it('encodes every space in the destination', () => {
      const html = render('![](/a b c d.png)', [lenientLinkDestinations]);
      expect(html).toContain('src="/a%20b%20c%20d.png"');
    });

    it('keeps the alt text, and the expandable suffix still matches', () => {
      const html = render('![a big cat expandable](/my cat.png)', [
        lenientLinkDestinations,
        expandableImages(),
      ]);
      expect(html).toContain('src="/my%20cat.png"');
      // The suffix was stripped, so the destination rewrite ran first.
      expect(html).toContain('alt="a big cat"');
    });

    it('preserves a title after the spaced destination', () => {
      const html = render('![cat](/my cat.png "a nice title")', [
        lenientLinkDestinations,
      ]);
      expect(html).toContain('src="/my%20cat.png"');
      expect(html).toContain('title="a nice title"');
    });

    it('leaves a well-formed destination untouched', () => {
      const html = render('![cat](/cat.png "a title")', [
        lenientLinkDestinations,
      ]);
      expect(html).toContain('src="/cat.png"');
      expect(html).toContain('title="a title"');
    });

    it('leaves an angle-bracketed destination to the parser', () => {
      const html = render('![cat](</my cat.png>)', [lenientLinkDestinations]);
      expect(html).toContain('src="/my%20cat.png"');
    });

    it('leaves whitespace around the destination alone', () => {
      // Legal CommonMark already: the destination itself has no space.
      const html = render('[go](\thttps://example.com/a\n)', [
        lenientLinkDestinations,
      ]);
      expect(html).toContain('href="https://example.com/a"');
    });

    it('does not rewrite inside a fenced code block', () => {
      const html = render('```\n![](/my cat.png)\n```', [
        lenientLinkDestinations,
      ]);
      expect(html).toContain('/my cat.png');
      expect(html).not.toContain('%20');
    });

    it('does not rewrite inside an inline code span', () => {
      const html = render('write `![](/my cat.png)` like this', [
        lenientLinkDestinations,
      ]);
      expect(html).toContain('/my cat.png');
      expect(html).not.toContain('%20');
    });

    it('rewrites prose on the same line as a code span', () => {
      const html = render('`code` then ![](/my cat.png)', [
        lenientLinkDestinations,
      ]);
      expect(html).toContain('src="/my%20cat.png"');
    });

    it('does not rewrite inside a code span that crosses a line', () => {
      const html = render('`a\n![](/my cat.png)` after', [
        lenientLinkDestinations,
      ]);
      expect(html).toContain('/my cat.png');
      expect(html).not.toContain('%20');
    });

    it('skips a destination containing parentheses rather than guessing', () => {
      const html = render('![](/a (b) c.png)', [lenientLinkDestinations]);
      expect(html).not.toContain('<img');
      expect(html).not.toContain('%20');
    });

    it('leaves the spaced destination as text when not enabled', () => {
      const html = render(cupStack);
      expect(html).not.toContain('<img');
      // GFM autolinks the leading run, leaving the rest as bare text.
      expect(html).toContain('stack ideas.png');
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

    it('translates a tight list item', () => {
      // Only the inserted paragraph makes the item a block rehypeLocalize
      // recognizes; without it the item text is never handed to the translator.
      activateLocalization();
      const html = render('- an item');
      expect(html).toContain('AN ITEM');
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
