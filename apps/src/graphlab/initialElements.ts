import {type Node} from '@xyflow/react';

export type TextNode = Node<{text: string}, 'text'>;
export type ResultNode = Node<{}, 'result'>;
export type WebNode = Node<{text: string}, 'web'>;
export type UppercaseNode = Node<{text: string}, 'uppercase'>;
export type AskChatNode = Node<{text: string}, 'askchat'>;
export type ConditionNode = Node<{text: string}, 'condition'>;
export type MyNode =
  | TextNode
  | ResultNode
  | UppercaseNode
  | AskChatNode
  | ConditionNode
  | WebNode;

export function isTextNode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any
): node is
  | TextNode
  | UppercaseNode
  | AskChatNode
  | WebNode
  | ConditionNode
  | undefined {
  return !node
    ? false
    : node.type === 'text' ||
        node.type === 'uppercase' ||
        node.type === 'askchat' ||
        node.type === 'web' ||
        node.type === 'condition';
}
