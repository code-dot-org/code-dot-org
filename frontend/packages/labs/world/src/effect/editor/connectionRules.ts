import type {Connection} from '@xyflow/react';

import {coerce} from '../glsl/valueTypes';
import {translate} from '../localization';
import {OUTPUT_NODE_ID} from '../model/constants';
import type {
  EffectGraphScope,
  EffectPortType,
  EffectValueType,
} from '../model/types';
import {ghostForNodeId} from '../nodes/ghosts';
import {findPort, type EffectNodeRegistry} from '../nodes/registry';
import type {EffectNodeDefinition} from '../nodes/types';

import {portTypeLabel} from './portTypes';
import {canSwizzle} from './swizzle';

/** What the editor knows about one port, wherever it lives. */
export interface PortInfo {
  type: EffectPortType;
  label: string;
}

/**
 * Concrete types the last compile worked out, by node id then port id — the
 * `resolvedPortTypes` of a `CompiledEffect`, for whichever scope is open.
 *
 * A definition can only declare a port `generic`; what a *particular* node's
 * generic port carries is decided by the graph around it. Passing these in is
 * what lets the connection rules reason about the Multiply that is really a
 * vec2 today, rather than about the word "generic".
 */
export type ResolvedPortTypes = Readonly<
  Record<string, Readonly<Record<string, EffectValueType>>>
>;

/** Declared type and label of a port, whether it belongs to a ghost or a node. */
export function portInfoOf(
  document: EffectGraphScope,
  registry: EffectNodeRegistry,
  nodeId: string,
  portId: string,
  direction: 'source' | 'target',
  resolved?: ResolvedPortTypes,
): PortInfo | undefined {
  const ghost = ghostForNodeId(document, nodeId);
  if (ghost) {
    return {type: ghost.type, label: ghost.label};
  }

  const node = document.nodes.find(candidate => candidate.id === nodeId);
  const definition = node && registry.get(node.type);
  if (!definition) {
    return undefined;
  }

  const ports = direction === 'source' ? definition.outputs : definition.inputs;
  const port = findPort(ports, portId);
  if (!port) {
    return undefined;
  }

  // Resolved types are consulted for the *source* end only. A generic input's
  // resolved type depends on what is wired into it — including the wire being
  // dragged right now — so using it here would be reasoning in a circle. An
  // output's type is settled by everything upstream, which this drag cannot
  // change.
  const concrete =
    port.type === 'generic' && direction === 'source'
      ? resolved?.[nodeId]?.[portId]
      : undefined;

  return {type: concrete ?? port.type, label: port.label};
}

/** The declared type of a port, whether it belongs to a ghost or a node. */
export function portTypeOf(
  document: EffectGraphScope,
  registry: EffectNodeRegistry,
  nodeId: string,
  portId: string,
  direction: 'source' | 'target',
  resolved?: ResolvedPortTypes,
): EffectPortType | undefined {
  return portInfoOf(document, registry, nodeId, portId, direction, resolved)
    ?.type;
}

/**
 * Whether a value of `source`'s type can flow into a port of `target`'s type.
 *
 * Generic ports accept any numeric type, because their concrete type is not
 * known until the graph around them is resolved — but never a texture. A
 * sampler cannot be multiplied or mixed, and the compiler would only discover
 * that after emitting GLSL the driver rejects; refusing the wire here puts the
 * error where the learner is looking.
 */
export function portsCompatible(
  source: EffectPortType,
  target: EffectPortType,
): boolean {
  if (source === 'sampler2D' || target === 'sampler2D') {
    return source === target;
  }
  if (source === 'generic' || target === 'generic') {
    return true;
  }
  return coerce('x', source, target) !== null;
}

/** A node the wire-drop picker can offer, and the port the wire would join. */
export interface ConnectableNode {
  definition: EffectNodeDefinition;
  /** The first compatible port on the new node. */
  portId: string;
}

/**
 * Every node in the registry that could terminate a dangling wire.
 *
 * `from` names the end that already exists: dragging forward from an output
 * (`source`) searches candidate inputs; dragging backward from an input
 * (`target`) searches candidate outputs. This is what makes the picker a
 * teaching surface — a texture wire offers exactly the nodes that can take a
 * texture, which today is Sample alone.
 */
export function connectableNodes(
  registry: EffectNodeRegistry,
  wireType: EffectPortType,
  from: 'source' | 'target',
): ConnectableNode[] {
  return registry.list().flatMap(definition => {
    const candidates =
      from === 'source' ? definition.inputs : definition.outputs;
    const match = candidates.find(port =>
      from === 'source'
        ? portsCompatible(wireType, port.type)
        : portsCompatible(port.type, wireType),
    );
    return match ? [{definition, portId: match.id}] : [];
  });
}

/** One end of an in-progress drag, as React Flow reports it. */
export interface DragEndpoint {
  nodeId: string;
  portId: string;
  /** Which kind of handle this is, not which end of the wire it will be. */
  handleType: 'source' | 'target';
}

/** `portTypeLabel`, adjusted to read after the article "a". */
function describeType(type: EffectPortType): string {
  return type === 'generic' ? translate('number') : portTypeLabel(type);
}

/**
 * Why a hovered connection would be refused, in a learner's words — or null
 * when it would be accepted.
 *
 * This is the flip side of `canConnect`: that function silently blocks the
 * drop, and silence teaches nothing. The strings here are the lesson — what
 * the wire carries, what the port wants, and when there is one, the node that
 * bridges the two.
 */
export function explainRefusal(
  document: EffectGraphScope,
  registry: EffectNodeRegistry,
  from: DragEndpoint,
  to: DragEndpoint,
  resolved?: ResolvedPortTypes,
): string | null {
  // Same-kind handles: the wire has no direction to flow in.
  if (from.handleType === to.handleType) {
    return translate(
      to.handleType === 'source'
        ? 'That is another output — wires run from an output into an input.'
        : 'That is another input — wires run from an output into an input.',
    );
  }

  // Orient the pair: the drag may have started from either end.
  const [source, target] =
    from.handleType === 'source' ? [from, to] : [to, from];

  if (source.nodeId === target.nodeId) {
    return translate(
      'A node cannot feed itself — its output would depend on its own input.',
    );
  }

  const sourceInfo = portInfoOf(
    document,
    registry,
    source.nodeId,
    source.portId,
    'source',
    resolved,
  );
  const targetInfo = portInfoOf(
    document,
    registry,
    target.nodeId,
    target.portId,
    'target',
  );
  if (!sourceInfo || !targetInfo) {
    return null;
  }

  // The Output accepts anything but a texture, mirroring `canConnect`.
  if (target.nodeId === OUTPUT_NODE_ID) {
    return sourceInfo.type === 'sampler2D'
      ? translate(
          'The Output needs a color, not a whole texture — Sample it first.',
        )
      : null;
  }

  if (portsCompatible(sourceInfo.type, targetInfo.type)) {
    return null;
  }

  // Not directly compatible, but the learner can pick a component on drop —
  // that is an invitation, not a refusal.
  if (canSwizzle(sourceInfo.type, targetInfo.type)) {
    return null;
  }

  if (sourceInfo.type === 'sampler2D') {
    return translate('This wire carries a texture — only Sample can read one.');
  }
  if (targetInfo.type === 'sampler2D') {
    return translate(
      '"{name}" needs a texture, and this wire carries a {source}.',
      {
        name: translate(targetInfo.label),
        source: describeType(sourceInfo.type),
      },
    );
  }

  // A numeric width mismatch, the one every learner hits eventually.
  const hint = translate(
    targetInfo.type === 'float'
      ? 'Split can pull a single number out of it.'
      : 'Split and Combine can reshape it.',
  );
  return `${translate(
    'This wire carries a {source}, but "{name}" takes a {target}.',
    {
      source: describeType(sourceInfo.type),
      name: translate(targetInfo.label),
      target: describeType(targetInfo.type),
    },
  )} ${hint}`;
}

/**
 * Whether a wire may be dropped.
 *
 * Blocking an impossible connection at drag time is better than letting it
 * land and reporting a compile error: the learner finds out while their
 * attention is still on the two ports.
 */
export function canConnect(
  document: EffectGraphScope,
  registry: EffectNodeRegistry,
  connection: Connection,
  resolved?: ResolvedPortTypes,
): boolean {
  if (!connection.sourceHandle || !connection.targetHandle) {
    return false;
  }
  if (connection.source === connection.target) {
    return false;
  }

  const sourceType = portTypeOf(
    document,
    registry,
    connection.source,
    connection.sourceHandle,
    'source',
    resolved,
  );
  const targetType = portTypeOf(
    document,
    registry,
    connection.target,
    connection.targetHandle,
    'target',
  );

  if (!sourceType || !targetType) {
    return false;
  }

  // The Output takes anything that is not a texture, matching the compiler's
  // deliberately forgiving `visualizeAsColor` rule for the final color.
  if (connection.target === OUTPUT_NODE_ID) {
    return sourceType !== 'sampler2D';
  }

  // A narrowing drop is allowed to *land*; the canvas then asks which
  // component was meant before writing anything to the document.
  return (
    portsCompatible(sourceType, targetType) ||
    canSwizzle(sourceType, targetType)
  );
}
