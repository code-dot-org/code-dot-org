import type {Element, ElementContent, Root, Text} from 'hast';
import toHtml from 'hast-util-to-html';
import visit from 'unist-util-visit';

import localization from '@cdo/apps/localization';

/**
 * A rehype plugin that localizes the text of every paragraph in rendered
 * markdown.
 *
 * Our translation engine (`localization.translate`) operates on real DOM, not
 * on hast, and refuses to touch `<code>` or embedded Blockly `<xml>`. So for
 * each `<p>` we serialize a placeholder-substituted copy to DOM, translate it,
 * and rebuild the hast from the translated DOM. The plugin must run after
 * sanitization (so `<code>`/`<xml>` are real hast elements) and before
 * rehype-react compiles the tree to React.
 *
 * See SafeMarkdown.jsx for how it is wired into the markdown pipeline.
 */

// Labels handed to our translation system to annotate the paragraph strings
// for translators. See localization.translate.
const LOCALIZATION_LABELS = ['markdown'];

// A hast <xml> element is the wrapper our remark plugins emit around embedded
// Blockly content. Its contents are not human language and must never be
// handed to the translator.
const isBlocklyXml = (node: Element): boolean => node.tagName === 'xml';

// hast nodes are plain JSON, so a structural clone is just a round-trip
// through JSON. We clone before mutating so the placeholder-swapping below
// never touches the original tree.
const cloneHast = <T>(node: T): T => JSON.parse(JSON.stringify(node));

/**
 * Walk the translated DOM produced by localization.translate and rebuild an
 * equivalent hast tree, which rehype-react then compiles to React. This is the
 * inverse of the hast->DOM serialization in localizeParagraph:
 *
 *   - placeholder spans (carrying `data-token`) are swapped back for the
 *     original, untranslated Blockly <xml> hast they stood in for;
 *   - the <span data-code-element> markers become <code> again;
 *   - `style` is left as a string — rehype-react parses it into the object
 *     form React requires.
 */
const domToHast = (
  domNode: Node,
  placeholders: Element[]
): ElementContent | null => {
  if (domNode.nodeType === Node.TEXT_NODE) {
    return {type: 'text', value: domNode.nodeValue ?? ''} as Text;
  }

  if (domNode.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const domElement = domNode as globalThis.Element;

  if (domElement.hasAttribute('data-token')) {
    return placeholders[Number(domElement.getAttribute('data-token'))];
  }

  const isCode = domElement.hasAttribute('data-code-element');

  const properties: Element['properties'] = {};
  for (const attr of domElement.attributes) {
    if (attr.name === 'data-token' || attr.name === 'data-code-element') {
      // Temporary markers used only on the way to the translator.
      continue;
    } else if (attr.name === 'class') {
      properties.className = attr.value.split(/\s+/).filter(Boolean);
    } else {
      properties[attr.name] = attr.value;
    }
  }

  const children: ElementContent[] = [];
  domElement.childNodes.forEach(child => {
    const result = domToHast(child, placeholders);
    if (result) {
      children.push(result);
    }
  });

  return {
    type: 'element',
    tagName: isCode ? 'code' : domElement.tagName.toLowerCase(),
    properties,
    children,
  };
};

/**
 * Localize a single <p> hast node in place:
 *
 *   1. Clone the paragraph and, in the clone, swap each <xml> block for an
 *      empty `<span data-token="i">` placeholder (stashing the original hast)
 *      and retag each <code> as `<span data-code-element>` — our translator
 *      does recognize <span>.
 *
 *   2. Serialize the clone to HTML, hand the resulting <p> DOM tree to
 *      localization.translate, and get back an equivalent DOM with the text
 *      nodes translated.
 *
 *   3. Walk the translated DOM back into hast (domToHast), restoring the
 *      stashed <xml> blocks and the <code> elements. The <p> keeps its
 *      original properties plus `data-isolate`/`data-notranslate` so the
 *      already-translated output is left alone when it lands on the page.
 */
const localizeParagraph = (node: Element): void => {
  const placeholders: Element[] = [];
  const clone = cloneHast(node);

  visit(clone, 'element', (el: Element, index, parent) => {
    if (isBlocklyXml(el) && parent && typeof index === 'number') {
      parent.children[index] = {
        type: 'element',
        tagName: 'span',
        properties: {dataToken: String(placeholders.length)},
        children: [],
      };
      placeholders.push(el);
      return [visit.SKIP, index];
    }
    if (el.tagName === 'code') {
      el.tagName = 'span';
      el.properties = {...(el.properties || {}), dataCodeElement: 'true'};
    }
  });

  // Serialize the existing hast structure into a DOM
  const domP = document.createElement('p');
  domP.setAttribute('data-isolate', 'true');
  domP.innerHTML = toHtml({type: 'root', children: clone.children});

  // Pass that DOM into the translation engine and it will return localized DOM
  const translated = localization.translate(domP, LOCALIZATION_LABELS);

  // Convert that back to the hast structure
  const children: ElementContent[] = [];
  translated.childNodes.forEach(child => {
    const result = domToHast(child, placeholders);
    if (result) {
      children.push(result);
    }
  });

  // Append the appropriate attributes
  node.children = children;
  node.properties = {
    // data-isolate just for the sake of annotating that we localized the shape
    dataIsolate: 'true',
    // data-notranslate will prevent the rendered DOM from being re-translated
    dataNotranslate: 'true',
    ...(node.properties || {}),
  };
};

/**
 * rehype plugin entry point: localize every paragraph in the tree.
 */
const localizeMarkdownParagraphs =
  () =>
  (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'p') {
        return;
      }

      localizeParagraph(node);

      // The rebuilt children are already translated; don't descend into them.
      return visit.SKIP;
    });
  };

export default localizeMarkdownParagraphs;
