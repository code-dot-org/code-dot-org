/**
 * @vitest-environment jsdom
 */

import {describe, expect, it} from 'vitest';

import Markdown, {reactMarkdownOptions} from '../components/Markdown';

// Markdown is a thin wrapper that delegates rendering to ReactMarkdown
// from markdown-to-jsx. Its job is to compute the right `options`
// (overrides + forceBlock/forceInline) and the right `className` /
// children. We call it as a plain function and inspect the resulting
// React element's props — this is tighter than testing-library, sidesteps
// the dependency, and matches what the component is actually responsible
// for.

interface MarkdownElementProps {
  options: {
    overrides: Record<string, unknown>;
    forceBlock: boolean;
    forceInline: boolean;
  };
  className?: string;
  children: string;
}

function render(props: Parameters<typeof Markdown>[0]) {
  return Markdown(props) as unknown as {
    props: MarkdownElementProps;
  };
}

describe('Markdown content vs children', () => {
  it('prefers the `content` prop over children', () => {
    const out = render({content: 'from content', children: 'from children'});
    expect(out.props.children).toBe('from content');
  });

  it('falls through to children when content is absent', () => {
    const out = render({children: 'just kids'});
    expect(out.props.children).toBe('just kids');
  });

  it('passes an empty string when neither content nor children is provided', () => {
    // The empty string is the documented fallback; ReactMarkdown handles
    // it gracefully.
    const out = render({});
    expect(out.props.children).toBe('');
  });
});

describe('Markdown forceBlock / forceInline', () => {
  it('defaults to block mode (forceBlock=true, forceInline=false)', () => {
    const out = render({content: '# h1'});
    expect(out.props.options.forceBlock).toBe(true);
    expect(out.props.options.forceInline).toBe(false);
  });

  it('inline=true flips both flags', () => {
    const out = render({content: 'hi', inline: true});
    expect(out.props.options.forceBlock).toBe(false);
    expect(out.props.options.forceInline).toBe(true);
  });
});

describe('Markdown overrides composition', () => {
  it('starts with the built-in design-system overrides (h1, p, a, …)', () => {
    const out = render({content: '# h1'});
    const overrides = out.props.options.overrides;
    // Pin a representative subset rather than every override — the full
    // list is in `reactMarkdownOptions` and tested via reference equality
    // below.
    expect(overrides.h1).toBe(reactMarkdownOptions.overrides.h1);
    expect(overrides.p).toBe(reactMarkdownOptions.overrides.p);
    expect(overrides.a).toBe(reactMarkdownOptions.overrides.a);
  });

  it('merges options.overrides over the defaults', () => {
    // markdown-to-jsx's Override type requires `props` alongside
    // `component` — use full-shape fixtures even though our assertion
    // only cares about reference identity.
    const myH1 = {component: 'div' as const, props: {}};
    const out = render({
      content: '# h1',
      options: {overrides: {h1: myH1}},
    });
    expect(out.props.options.overrides.h1).toBe(myH1);
    // Other defaults are preserved.
    expect(out.props.options.overrides.p).toBe(
      reactMarkdownOptions.overrides.p,
    );
  });

  it('overrides prop wins over options.overrides (last-write semantics)', () => {
    const fromOptions = {component: 'div' as const, props: {}};
    const fromOverrides = {component: 'span' as const, props: {}};
    const out = render({
      content: '# h1',
      options: {overrides: {h1: fromOptions}},
      overrides: {h1: fromOverrides},
    });
    expect(out.props.options.overrides.h1).toBe(fromOverrides);
  });
});

describe('Markdown className composition', () => {
  it('always includes the module-scoped container class', () => {
    const out = render({content: 'x'});
    // The exact name varies by CSS module hashing; just assert presence
    // of a non-empty string. (The shape — see classNames(moduleStyles, …)
    // — guarantees we passed both the module class and the prop class.)
    expect(typeof out.props.className).toBe('string');
    expect(out.props.className!.length).toBeGreaterThan(0);
  });

  it('appends a user-supplied className alongside the module class', () => {
    const out = render({content: 'x', className: 'custom-cls'});
    expect(out.props.className).toContain('custom-cls');
  });
});
