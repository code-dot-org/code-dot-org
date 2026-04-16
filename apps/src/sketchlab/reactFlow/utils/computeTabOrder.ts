import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

/**
 * Compare two nodes by position: top-to-bottom (y), then left-to-right (x).
 */
function compareByPosition(
  a: SketchlabReactFlowNode,
  b: SketchlabReactFlowNode
): number {
  return a.position.y - b.position.y || a.position.x - b.position.x;
}

/**
 * Find connected components in the undirected version of the graph.
 * Returns an array of Sets, each containing the node IDs in one component.
 */
function findComponents(
  nodeIds: string[],
  edges: SketchlabReactFlowEdge[]
): Set<string>[] {
  const parent = new Map<string, string>();
  for (const id of nodeIds) {
    parent.set(id, id);
  }

  function find(nodeId: string): string {
    while (parent.get(nodeId) !== nodeId) {
      parent.set(nodeId, parent.get(parent.get(nodeId)!)!);
      nodeId = parent.get(nodeId)!;
    }
    return nodeId;
  }

  function union(nodeA: string, nodeB: string) {
    const rootA = find(nodeA);
    const rootB = find(nodeB);
    if (rootA !== rootB) {
      parent.set(rootA, rootB);
    }
  }

  for (const edge of edges) {
    if (parent.has(edge.source) && parent.has(edge.target)) {
      union(edge.source, edge.target);
    }
  }

  const groups = new Map<string, Set<string>>();
  for (const id of nodeIds) {
    const root = find(id);
    if (!groups.has(root)) {
      groups.set(root, new Set());
    }
    groups.get(root)!.add(id);
  }

  return Array.from(groups.values());
}

/**
 * Produce a traversal order for a single connected component using Kahn's
 * topological sort. When multiple nodes have in-degree 0 simultaneously,
 * ties are broken by position (top-to-bottom, left-to-right).
 *
 * If the graph has a cycle (topo sort doesn't consume all nodes), remaining
 * nodes are appended sorted by position.
 */
function orderComponent(
  componentIds: Set<string>,
  nodeMap: Map<string, SketchlabReactFlowNode>,
  outgoing: Map<string, string[]>
): string[] {
  // Build in-degree counts scoped to this component.
  const inDegree = new Map<string, number>();
  for (const id of componentIds) {
    inDegree.set(id, 0);
  }
  for (const id of componentIds) {
    for (const target of outgoing.get(id) || []) {
      if (componentIds.has(target)) {
        inDegree.set(target, (inDegree.get(target) || 0) + 1);
      }
    }
  }

  // Seed the queue with all zero-in-degree nodes, sorted by position.
  const queue: string[] = [];
  for (const id of componentIds) {
    if (inDegree.get(id) === 0) {
      queue.push(id);
    }
  }
  queue.sort((a, b) => compareByPosition(nodeMap.get(a)!, nodeMap.get(b)!));

  const result: string[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    result.push(current);

    // Collect newly available neighbors and re-sort the queue by position.
    const newlyAvailable: string[] = [];
    for (const target of outgoing.get(current) || []) {
      if (componentIds.has(target) && !visited.has(target)) {
        const degree = (inDegree.get(target) || 1) - 1;
        inDegree.set(target, degree);
        if (degree === 0) {
          newlyAvailable.push(target);
        }
      }
    }
    queue.push(...newlyAvailable);
    queue.sort((a, b) => compareByPosition(nodeMap.get(a)!, nodeMap.get(b)!));
  }

  // Cycle fallback: any unvisited nodes in the component, sorted by position.
  if (visited.size < componentIds.size) {
    const remaining = Array.from(componentIds).filter(id => !visited.has(id));
    remaining.sort((a, b) =>
      compareByPosition(nodeMap.get(a)!, nodeMap.get(b)!)
    );
    result.push(...remaining);
  }

  return result;
}

export type TabOrderEntry = {type: 'node' | 'edge'; id: string};

/** True when two tab order entries refer to the same element. */
export function entriesMatch(a: TabOrderEntry, b: TabOrderEntry): boolean {
  return a.type === b.type && a.id === b.id;
}

/**
 * Resolve the focused React Flow node or edge from a DOM element by walking
 * up to the nearest `.react-flow__node` or `.react-flow__edge` wrapper.
 */
export function getEntryFromDOM(target: HTMLElement): TabOrderEntry | null {
  const nodeEl = target.closest('.react-flow__node');
  if (nodeEl) return {type: 'node', id: nodeEl.getAttribute('data-id')!};
  const edgeEl = target.closest('.react-flow__edge');
  if (edgeEl) return {type: 'edge', id: edgeEl.getAttribute('data-id')!};
  return null;
}

/**
 * Compute a logical tab order for React Flow nodes and edges.
 *
 * 1. Nodes connected by edges are traversed first, following edge direction
 *    via topological sort (position breaks ties at branch points).
 * 2. Edges are interleaved right before their target node, so the order for
 *    A→B→C is: [NodeA, Edge(A→B), NodeB, Edge(B→C), NodeC].
 * 3. Connected components are sorted by the position of their first node.
 * 4. Orphan nodes (no edges) come last, sorted top-to-bottom, left-to-right.
 */
export function computeTabOrder(
  nodes: SketchlabReactFlowNode[],
  edges: SketchlabReactFlowEdge[]
): TabOrderEntry[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map<string, SketchlabReactFlowNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Build outgoing adjacency list, filtering to edges whose endpoints exist.
  const outgoing = new Map<string, string[]>();
  const connectedIds = new Set<string>();
  const validEdges: SketchlabReactFlowEdge[] = [];
  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) continue;
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
    validEdges.push(edge);
    if (!outgoing.has(edge.source)) {
      outgoing.set(edge.source, []);
    }
    outgoing.get(edge.source)!.push(edge.target);
  }

  // Find connected components among nodes that participate in edges.
  const connectedNodeIds = Array.from(connectedIds);
  const components = findComponents(connectedNodeIds, validEdges);

  // Order each component internally, then sort components by their first node.
  const componentOrders = components.map(comp =>
    orderComponent(comp, nodeMap, outgoing)
  );
  componentOrders.sort((a, b) =>
    compareByPosition(nodeMap.get(a[0])!, nodeMap.get(b[0])!)
  );

  const nodeOrder = componentOrders.flat();

  // O(1) index lookup for sorting incoming edges by source position.
  const nodeIndex = new Map<string, number>();
  for (let i = 0; i < nodeOrder.length; i++) {
    nodeIndex.set(nodeOrder[i], i);
  }

  // Build incoming-edge lookup: target nodeId → edges arriving at it.
  const incomingEdges = new Map<string, SketchlabReactFlowEdge[]>();
  for (const edge of validEdges) {
    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, []);
    }
    incomingEdges.get(edge.target)!.push(edge);
  }

  // Interleave: for each node, insert its incoming edges right before it.
  // Edges are sorted so those from earlier sources come first.
  const result: TabOrderEntry[] = [];
  for (const nodeId of nodeOrder) {
    const incoming = incomingEdges.get(nodeId);
    if (incoming) {
      incoming.sort(
        (a, b) =>
          (nodeIndex.get(a.source) ?? 0) - (nodeIndex.get(b.source) ?? 0)
      );
      for (const edge of incoming) {
        result.push({type: 'edge', id: edge.id});
      }
    }
    result.push({type: 'node', id: nodeId});
  }

  // Orphan nodes: not part of any edge.
  const orphans = nodes
    .filter(node => !connectedIds.has(node.id))
    .sort(compareByPosition);
  for (const orphan of orphans) {
    result.push({type: 'node', id: orphan.id});
  }

  return result;
}
