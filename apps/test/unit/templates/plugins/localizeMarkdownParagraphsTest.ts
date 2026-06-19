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

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

describe('localizeMarkdownParagraphs rehype plugin', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // With Localize uninitialized, localization.translate is a pass-through, so
  // these cases exercise the structural transform (placeholder swap and
  // restore) independently of any actual translation.
  describe('structural transform (translate is a no-op)', () => {
    it('marks paragraphs data-isolate/data-notranslate and preserves content', () => {
      const tree = localize(
        root([el('p', {}, [text('Hello '), el('strong', {}, [text('world')])])])
      );

      const p = tree.children[0] as Element;
      expect(p.properties).toEqual({
        dataIsolate: 'true',
        dataNotranslate: 'true',
      });
      expect(p.children).toEqual([
        text('Hello '),
        el('strong', {}, [text('world')]),
      ]);
    });

    it('leaves non-paragraph nodes untouched', () => {
      // A heading and a top-level Blockly <xml> block, neither of which is a
      // paragraph, must pass through unchanged.
      const tree = root([
        el('h1', {}, [text('Title')]),
        el('xml', {}, [el('block', {type: 'turtle'}, [])]),
      ]);
      const before = deepClone(tree);

      expect(localize(tree)).toEqual(before);
    });

    it('round-trips <code> back to <code>, dropping the temporary marker', () => {
      const tree = localize(
        root([el('p', {}, [text('see '), el('code', {}, [text('foo()')])])])
      );

      const code = (tree.children[0] as Element).children[1] as Element;
      expect(code.tagName).toBe('code');
      expect(code.properties).toEqual({});
      expect(code.children).toEqual([text('foo()')]);
    });

    it('preserves a visual code block class and inline style as a string', () => {
      const tree = localize(
        root([
          el('p', {}, [
            el(
              'code',
              {
                className: ['visual-block'],
                style: 'background-color: #c0ffee;',
              },
              [text('visual')]
            ),
          ]),
        ])
      );

      const code = (tree.children[0] as Element).children[0] as Element;
      expect(code.tagName).toBe('code');
      // style stays a string here — rehype-react parses it into React's object
      // form downstream.
      expect(code.properties).toEqual({
        className: ['visual-block'],
        style: 'background-color: #c0ffee;',
      });
    });

    it('restores an inline Blockly <xml> block verbatim', () => {
      const xmlNode = el('xml', {}, [el('block', {type: 'turtle'}, [])]);
      const tree = localize(
        root([el('p', {}, [text('run '), xmlNode, text(' now')])])
      );

      expect((tree.children[0] as Element).children[1]).toEqual(xmlNode);
    });
  });

  describe('translation', () => {
    it('translates text but shields <code> and <xml> from the translator', () => {
      // Mock the translator to upper-case every text node, and capture exactly
      // what DOM it was handed.
      let handedToTranslator = '';
      const upperCaseText = (node: globalThis.Node): void => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.nodeValue = (node.nodeValue ?? '').toUpperCase();
        }
        node.childNodes.forEach(upperCaseText);
      };
      jest.spyOn(localization, 'translate').mockImplementation(((
        node: HTMLElement
      ) => {
        handedToTranslator = node.innerHTML;
        upperCaseText(node);
        return node;
      }) as typeof localization.translate);

      const xmlNode = el('xml', {}, [el('block', {type: 'turtle'}, [])]);
      const tree = localize(
        root([
          el('p', {}, [
            text('press '),
            el('code', {}, [text('go')]),
            text(' then '),
            xmlNode,
          ]),
        ])
      );

      const p = tree.children[0] as Element;

      // Plain text is translated.
      expect((p.children[0] as Text).value).toBe('PRESS ');
      expect((p.children[2] as Text).value).toBe(' THEN ');
      // <code> content is translated (it rides through as a <span>) but the
      // element is restored to <code>.
      const code = p.children[1] as Element;
      expect(code.tagName).toBe('code');
      expect(code.children).toEqual([text('GO')]);
      // The Blockly <xml> is restored unaltered...
      expect(p.children[3]).toEqual(xmlNode);
      // ...because the translator only ever saw an empty placeholder span, not
      // the block markup.
      expect(handedToTranslator).toContain('data-token="0"');
      expect(handedToTranslator).not.toContain('block');
    });

    it('annotates the strings with the markdown label', () => {
      const translateSpy = jest.spyOn(localization, 'translate');

      localize(root([el('p', {}, [text('hi')])]));

      expect(translateSpy).toHaveBeenCalledWith(expect.anything(), [
        'markdown',
      ]);
    });
  });
});
