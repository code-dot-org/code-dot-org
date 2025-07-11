import {type Node} from '@xyflow/react';

export type AiNode = Node<{text: string}, 'ai'>;
export type ConditionNode = Node<{text: string}, 'condition'>;
export type TextNode = Node<{text: string}, 'text'>;
export type OutputNode = Node<Record<string, never>, 'output'>;
export type WebNode = Node<{text: string}, 'web'>;
export type MyNode = AiNode | TextNode | OutputNode | ConditionNode | WebNode;

export function isTextNode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any
): node is TextNode | AiNode | WebNode | ConditionNode | undefined {
  return !node ? false : ['ai', 'condition', 'text', 'web'].includes(node.type);
}
