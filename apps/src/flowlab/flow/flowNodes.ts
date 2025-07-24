import {type Node, useNodesData, useNodeConnections} from '@xyflow/react';

export type AiNode = Node<{text: string}, 'ai'>;
export type ConditionNode = Node<{text: string}, 'condition'>;
export type TextNode = Node<{text: string}, 'text'>;
export type ResultNode = Node<Record<string, never>, 'result'>;
export type WebNode = Node<{text: string}, 'web'>;

export type MyNode = AiNode | TextNode | ResultNode | ConditionNode | WebNode;

export function useInputTexts(): string[] {
  // Find all incoming connections.
  const connections = useNodeConnections({
    handleType: 'target',
  });

  // Get all source nodes connected to the target handle.
  const nodesData = useNodesData<MyNode>(
    connections.map(connection => connection.source)
  );

  // Return an array with a single empty string if there's nothing.
  if (nodesData.length === 0) {
    return [''];
  }

  // Return an array of strings, one for each input.
  return nodesData.map(nodeData => {
    return nodeData && 'text' in nodeData.data ? nodeData.data.text : '';
  });
}
