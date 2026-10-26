import {
  GHOST_PORT,
  INPUT_NODE_IDS,
  INPUT_TEXTURE_NODE_ID,
  INPUT_UV_NODE_ID,
  OUTPUT_NODE_ID,
  emptyEffectDocument,
  functionNodeType,
  isGhostNodeId,
  parameterIdFromNodeId,
  parameterNodeId,
} from './constants';
import type {
  EffectDocument,
  EffectFunction,
  EffectGraphScope,
  EffectGraphEdge,
  EffectGraphNode,
  EffectLiteral,
  EffectParameter,
  EffectPosition,
  EffectPortRef,
} from './types';

/**
 * Pure helpers for reading and updating an `EffectDocument`. Every mutation
 * returns a new document — the editor holds documents in React state, and
 * undo/redo is a stack of these values.
 */

/** A passthrough effect: the input texture sampled at the input UV. */
export function createEffectDocument(name?: string): EffectDocument {
  const document = emptyEffectDocument(name);
  const sample: EffectGraphNode = {
    id: 'sample-1',
    type: 'sample',
    position: {x: 0, y: 0},
  };

  return {
    ...document,
    nodes: [sample],
    edges: [
      edge(
        {node: INPUT_TEXTURE_NODE_ID, port: GHOST_PORT},
        {node: sample.id, port: 'texture'},
      ),
      edge(
        {node: INPUT_UV_NODE_ID, port: GHOST_PORT},
        {node: sample.id, port: 'uv'},
      ),
      edge(
        {node: sample.id, port: 'color'},
        {node: OUTPUT_NODE_ID, port: GHOST_PORT},
      ),
    ],
  };
}

/** Build an edge with an id derived from its endpoints. */
export function edge(
  source: EffectPortRef,
  target: EffectPortRef,
): EffectGraphEdge {
  return {
    id: `${source.node}.${source.port}->${target.node}.${target.port}`,
    source,
    target,
  };
}

export function findNode(
  document: EffectGraphScope,
  nodeId: string,
): EffectGraphNode | undefined {
  return document.nodes.find(node => node.id === nodeId);
}

export function findParameter(
  document: EffectGraphScope,
  parameterId: string,
): EffectParameter | undefined {
  return document.parameters.find(parameter => parameter.id === parameterId);
}

/** The wire arriving at an input port, if any. Inputs hold at most one. */
export function incomingEdge(
  document: EffectGraphScope,
  target: EffectPortRef,
): EffectGraphEdge | undefined {
  return document.edges.find(
    candidate =>
      candidate.target.node === target.node &&
      candidate.target.port === target.port,
  );
}

/** A node id not already used in the document, prefixed by node type. */
export function nextNodeId<S extends EffectGraphScope>(
  document: S,
  type: string,
): string {
  const taken = new Set(document.nodes.map(node => node.id));
  let index = 1;
  while (taken.has(`${type}-${index}`)) {
    index += 1;
  }
  return `${type}-${index}`;
}

/**
 * A parameter id not already used in the document.
 *
 * Scanning for a free index rather than counting matters: after `param1` of
 * two is deleted, `length + 1` would mint a second `param2` — and the id seeds
 * the uniform name, so a collision silently merges two knobs into one uniform.
 */
export function nextParameterId(document: EffectGraphScope): string {
  const taken = new Set(document.parameters.map(parameter => parameter.id));
  let index = 1;
  while (taken.has(`param${index}`)) {
    index += 1;
  }
  return `param${index}`;
}

export function addNode<S extends EffectGraphScope>(
  document: S,
  node: EffectGraphNode,
): S {
  return {...document, nodes: [...document.nodes, node]};
}

/** Remove a node and every wire touching it. Ghosts are not removable. */
export function removeNode<S extends EffectGraphScope>(
  document: S,
  nodeId: string,
): S {
  if (isGhostNodeId(nodeId)) {
    return document;
  }

  return {
    ...document,
    nodes: document.nodes.filter(node => node.id !== nodeId),
    edges: document.edges.filter(
      candidate =>
        candidate.source.node !== nodeId && candidate.target.node !== nodeId,
    ),
  };
}

export function updateNode<S extends EffectGraphScope>(
  document: S,
  nodeId: string,
  changes: Partial<Omit<EffectGraphNode, 'id'>>,
): S {
  return {
    ...document,
    nodes: document.nodes.map(node =>
      node.id === nodeId ? {...node, ...changes} : node,
    ),
  };
}

/** Set the literal used by an input port while nothing is wired into it. */
export function setNodeLiteral<S extends EffectGraphScope>(
  document: S,
  nodeId: string,
  portId: string,
  value: EffectLiteral,
): S {
  return setNodeLiterals(document, nodeId, {[portId]: value});
}

/**
 * Write or clear a node's note.
 *
 * An empty or blank note is stored as no note at all, so "delete the text"
 * and "delete the note" are the same gesture and the graph never carries an
 * empty bubble.
 */
export function setNodeNote<S extends EffectGraphScope>(
  document: S,
  nodeId: string,
  note: string | undefined,
): S {
  const trimmed = note?.trim();
  return {
    ...document,
    nodes: document.nodes.map(node => {
      if (node.id !== nodeId) {
        return node;
      }
      if (!trimmed) {
        const {note: removed, ...rest} = node;
        void removed;
        return rest;
      }
      return {...node, note};
    }),
  };
}

/** Set several of a node's literals at once — one document step, not N. */
export function setNodeLiterals<S extends EffectGraphScope>(
  document: S,
  nodeId: string,
  values: Readonly<Record<string, EffectLiteral>>,
): S {
  return {
    ...document,
    nodes: document.nodes.map(node =>
      node.id === nodeId
        ? {...node, params: {...node.params, ...values}}
        : node,
    ),
  };
}

/**
 * True when `nodeId` can still be the source end of a wire in `document`.
 *
 * Pasting can outlive the things a copied wire pointed at: a parameter ghost
 * whose parameter was deleted, or a workspace node that is gone. The stock
 * input ghosts are constants and always available; the output ghost is never
 * a source.
 */
function sourceAvailable(
  document: EffectGraphScope,
  nodeId: string,
  stockInputsAvailable: boolean,
): boolean {
  const parameterId = parameterIdFromNodeId(nodeId);
  if (parameterId !== null) {
    return document.parameters.some(parameter => parameter.id === parameterId);
  }
  if (isGhostNodeId(nodeId)) {
    return (
      stockInputsAvailable &&
      (INPUT_NODE_IDS as readonly string[]).includes(nodeId)
    );
  }
  return document.nodes.some(node => node.id === nodeId);
}

/**
 * Insert copies of `nodes` (and the wires among and into them) with fresh ids.
 *
 * This is the engine under duplicate and paste. The rules mirror what a
 * learner would expect of "a copy of this piece of the graph":
 *
 * - Wires *between* copied nodes are copied, remapped onto the clones.
 * - Wires *into* a copied node from anything else — another node, an input
 *   knob, a parameter — are copied too, so the piece arrives still fed.
 * - Wires *out of* a copied node are not: an input takes one wire, so copying
 *   them would steal the original's downstream connections.
 */
export function insertNodes<S extends EffectGraphScope>(
  document: S,
  nodes: readonly EffectGraphNode[],
  edges: readonly EffectGraphEdge[],
  offset: EffectPosition,
  options: {stockInputsAvailable?: boolean} = {},
): S {
  if (nodes.length === 0) {
    return document;
  }

  const taken = new Set(document.nodes.map(node => node.id));
  const cloneIds = new Map<string, string>();

  const clones = nodes.map(node => {
    let index = 1;
    while (taken.has(`${node.type}-${index}`)) {
      index += 1;
    }
    const id = `${node.type}-${index}`;
    taken.add(id);
    cloneIds.set(node.id, id);
    return {
      ...node,
      id,
      position: {x: node.position.x + offset.x, y: node.position.y + offset.y},
      params: node.params ? {...node.params} : undefined,
    };
  });

  const clonedEdges = edges.flatMap(candidate => {
    const targetClone = cloneIds.get(candidate.target.node);
    if (!targetClone) {
      // Outgoing wires are never copied; see above.
      return [];
    }
    const sourceClone = cloneIds.get(candidate.source.node);
    const source = sourceClone
      ? {node: sourceClone, port: candidate.source.port}
      : candidate.source;
    if (
      !sourceClone &&
      !sourceAvailable(
        document,
        source.node,
        options.stockInputsAvailable ?? true,
      )
    ) {
      return [];
    }
    return [edge(source, {node: targetClone, port: candidate.target.port})];
  });

  return {
    ...document,
    nodes: [...document.nodes, ...clones],
    edges: [...document.edges, ...clonedEdges],
  };
}

/** Duplicate the given workspace nodes in place, offset from the originals. */
export function duplicateNodes<S extends EffectGraphScope>(
  document: S,
  nodeIds: readonly string[],
  offset: EffectPosition,
  options: {stockInputsAvailable?: boolean} = {},
): S {
  const wanted = new Set(nodeIds);
  const originals = document.nodes.filter(node => wanted.has(node.id));
  const relevantEdges = document.edges.filter(candidate =>
    wanted.has(candidate.target.node),
  );
  return insertNodes(document, originals, relevantEdges, offset, options);
}

/**
 * Connect two ports.
 *
 * An input port accepts a single wire, so any existing wire into `target` is
 * replaced — which is what makes dragging onto an occupied input feel like
 * rewiring rather than an error.
 */
export function connect<S extends EffectGraphScope>(
  document: S,
  source: EffectPortRef,
  target: EffectPortRef,
): S {
  const withoutExisting = document.edges.filter(
    candidate =>
      candidate.target.node !== target.node ||
      candidate.target.port !== target.port,
  );

  return {...document, edges: [...withoutExisting, edge(source, target)]};
}

export function disconnect<S extends EffectGraphScope>(
  document: S,
  edgeId: string,
): S {
  return {
    ...document,
    edges: document.edges.filter(candidate => candidate.id !== edgeId),
  };
}

export function addParameter<S extends EffectGraphScope>(
  document: S,
  parameter: EffectParameter,
): S {
  return {...document, parameters: [...document.parameters, parameter]};
}

/** Remove a parameter along with any wires leaving its ghost. */
export function removeParameter<S extends EffectGraphScope>(
  document: S,
  parameterId: string,
): S {
  const nodeId = parameterNodeId(parameterId);

  return {
    ...document,
    parameters: document.parameters.filter(
      parameter => parameter.id !== parameterId,
    ),
    edges: document.edges.filter(candidate => candidate.source.node !== nodeId),
  };
}

export function findFunction(
  document: EffectDocument,
  functionId: string,
): EffectFunction | undefined {
  return document.functions.find(candidate => candidate.id === functionId);
}

/** A function id not already used in the document. */
export function nextFunctionId(document: EffectDocument): string {
  const taken = new Set(document.functions.map(candidate => candidate.id));
  let index = 1;
  while (taken.has(`fn${index}`)) {
    index += 1;
  }
  return `fn${index}`;
}

/** Create an empty function. It starts with no inputs and returns a number. */
export function createFunction(
  document: EffectDocument,
  id: string,
  name: string,
): EffectDocument {
  return {
    ...document,
    functions: [
      ...document.functions,
      {id, name, outputType: 'float', parameters: [], nodes: [], edges: []},
    ],
  };
}

export function updateFunction(
  document: EffectDocument,
  functionId: string,
  changes: Partial<Omit<EffectFunction, 'id'>>,
): EffectDocument {
  return {
    ...document,
    functions: document.functions.map(candidate =>
      candidate.id === functionId ? {...candidate, ...changes} : candidate,
    ),
  };
}

/**
 * Remove a function and, cascading, every node that called it — in the main
 * workspace and inside other functions — along with those nodes' wires.
 */
export function removeFunction(
  document: EffectDocument,
  functionId: string,
): EffectDocument {
  const callType = functionNodeType(functionId);

  const strip = <S extends EffectGraphScope>(scope: S): S => {
    const dead = new Set(
      scope.nodes.filter(node => node.type === callType).map(node => node.id),
    );
    if (dead.size === 0) {
      return scope;
    }
    return {
      ...scope,
      nodes: scope.nodes.filter(node => !dead.has(node.id)),
      edges: scope.edges.filter(
        candidate =>
          !dead.has(candidate.source.node) && !dead.has(candidate.target.node),
      ),
    };
  };

  return strip({
    ...document,
    functions: document.functions
      .filter(candidate => candidate.id !== functionId)
      .map(strip),
  });
}

/**
 * Apply a graph operation to one scope of the document: the main workspace
 * when `functionId` is null, or the named function's body.
 *
 * This is what lets the editor run one set of handlers — connect, move,
 * delete, paste — against whichever workspace is open.
 */
export function applyToScope(
  document: EffectDocument,
  functionId: string | null,
  operation: (scope: EffectGraphScope) => EffectGraphScope,
): EffectDocument {
  if (functionId === null) {
    return {...document, ...operation(document)};
  }
  return {
    ...document,
    functions: document.functions.map(candidate =>
      candidate.id === functionId
        ? {...candidate, ...operation(candidate)}
        : candidate,
    ),
  };
}

export function updateParameter<S extends EffectGraphScope>(
  document: S,
  parameterId: string,
  changes: Partial<Omit<EffectParameter, 'id'>>,
): S {
  return {
    ...document,
    parameters: document.parameters.map(parameter =>
      parameter.id === parameterId ? {...parameter, ...changes} : parameter,
    ),
  };
}
