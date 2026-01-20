/**
 * Codemod to update Tags usage to the new Tag API.
 *
 * - Renames `onClose` -> `onDelete`
 * - Removes `type="closable"` / `type: 'closable'` / `type: 'default'`
 */
import type {API, FileInfo, JSXAttribute, Literal, Property} from 'jscodeshift';

import {transformTagPropsCore} from '../src/tags/tagPropsToMuiCore';

interface LiteralNode extends Literal {
  type: 'Literal' | 'StringLiteral';
  value: string | number | boolean | null;
}

interface PropertyNode extends Property {
  key: {name?: string; value?: string};
  value?: LiteralNode;
}

interface JSXAttributeNode extends JSXAttribute {
  name: {name: string};
  value?: LiteralNode | null;
}

function isClosableTypeLiteral(value?: LiteralNode) {
  if (!value) return false;
  if (value.type === 'Literal' || value.type === 'StringLiteral') {
    return value.value === 'closable' || value.value === 'default';
  }
  return false;
}

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let modified = false;

  root.find(j.ObjectExpression).forEach(path => {
    const props = (path.value.properties || []) as PropertyNode[];
    const nextProps: PropertyNode[] = [];

    props.forEach(prop => {
      const keyName = 'name' in prop.key ? prop.key.name : prop.key.value;

      if (keyName === 'onClose') {
        modified = true;
        nextProps.push(
          j.property('init', j.identifier('onDelete'), prop.value),
        );
        return;
      }

      if (
        keyName === 'variant' &&
        prop.value &&
        (prop.value.type === 'Literal' || prop.value.type === 'StringLiteral')
      ) {
        const core = transformTagPropsCore({
          variant: prop.value.value as string,
        });
        if (core.variant !== prop.value.value) {
          modified = true;
          nextProps.push(
            j.property(
              'init',
              j.identifier('variant'),
              j.stringLiteral(core.variant),
            ),
          );
          return;
        }
      }

      if (keyName === 'type' && isClosableTypeLiteral(prop.value)) {
        modified = true;
        return;
      }

      nextProps.push(prop);
    });

    path.value.properties = nextProps;
  });

  root
    .find(j.JSXAttribute)
    .filter(path => (path.value as JSXAttributeNode).name.name === 'onClose')
    .forEach(path => {
      modified = true;
      (path.value as JSXAttributeNode).name.name = 'onDelete';
    });

  root
    .find(j.JSXAttribute)
    .filter(path => (path.value as JSXAttributeNode).name.name === 'type')
    .forEach(path => {
      const value = (path.value as JSXAttributeNode)
        .value as LiteralNode | null;
      if (value && isClosableTypeLiteral(value)) {
        modified = true;
        j(path).remove();
      }
    });

  return modified ? root.toSource({quote: 'single'}) : file.source;
}
