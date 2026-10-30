import type {Element, ElementContent, Root, Text} from 'hast';

import localization from '@cdo/apps/localization';
import localizeMarkdownParagraphs from '@cdo/apps/templates/plugins/localizeMarkdownParagraphs';

// Small hast builders to keep the trees below readable.
const text = (value: string): Text => ({type: 'text', value});
const el = (
  tagName: string,
  properties: Element['properties'],
  children: ElementContent[]
): Element => ({type: 'element', tagName, properties, children});
const root = (children: ElementContent[]): Root => ({type: 'root', children});

// Run the plugin's transformer over a tree, mutating it in place, and return it.
const localize = (tree: Root): Root => {
  localizeMarkdownParagraphs()(tree);
  return tree;
};

describe('localizeMarkdownParagraphs rehype plugin', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('marks paragraphs data-isolate only and preserves content', () => {
    const tree = localize(
      root([el('p', {}, [text('Hello '), el('strong', {}, [text('world')])])])
    );

    const p = tree.children[0] as Element;
    expect(p.properties).toEqual({dataIsolate: 'true'});
    expect(p.children).toEqual([
      text('Hello '),
      el('strong', {}, [text('world')]),
    ]);
  });

  it('keeps existing paragraph properties', () => {
    const tree = localize(root([el('p', {className: ['intro']}, [])]));

    expect((tree.children[0] as Element).properties).toEqual({
      dataIsolate: 'true',
      className: ['intro'],
    });
  });

  it('leaves <code> in place', () => {
    const code = el('code', {}, [text('foo()')]);
    const tree = localize(root([el('p', {}, [text('see '), code])]));

    expect((tree.children[0] as Element).children[1]).toEqual(
      el('code', {}, [text('foo()')])
    );
  });

  it('marks an inline Blockly <xml> data-ignore and leaves its blocks alone', () => {
    const tree = localize(
      root([
        el('p', {}, [
          text('run '),
          el('xml', {}, [el('block', {type: 'turtle'}, [])]),
          text(' now'),
        ]),
      ])
    );

    expect((tree.children[0] as Element).children[1]).toEqual(
      el('xml', {dataIgnore: 'true'}, [el('block', {type: 'turtle'}, [])])
    );
  });

  it('marks a top-level Blockly <xml> data-ignore', () => {
    const tree = localize(
      root([
        el('h1', {}, [text('Title')]),
        el('xml', {}, [el('block', {type: 'turtle'}, [])]),
      ])
    );

    expect(tree.children[0]).toEqual(el('h1', {}, [text('Title')]));
    expect(tree.children[1]).toEqual(
      el('xml', {dataIgnore: 'true'}, [el('block', {type: 'turtle'}, [])])
    );
  });

  it('does not call the translator', () => {
    const translateSpy = jest.spyOn(localization, 'translate');

    localize(root([el('p', {}, [text('hi')])]));

    expect(translateSpy).not.toHaveBeenCalled();
  });
});
