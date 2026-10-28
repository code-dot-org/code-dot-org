import type {Element, Root} from 'hast';
import visit from 'unist-util-visit';

const stripStyles =
  () =>
  (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      delete node.properties?.style;
    });
  };

export default stripStyles;
