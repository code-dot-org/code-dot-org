import {COMMENT_NODE_TYPE} from '../../model/constants';
import type {EffectNodeDefinition} from '../types';

import {defineNode} from './helpers';

/**
 * A note that stands on its own in the workspace.
 *
 * Every node can carry a note explaining what it does *there*; this is the
 * same field with nothing attached to it, for the things a graph needs to say
 * that do not belong to any one step — what the effect is for, what to try
 * next, why a branch was left in.
 *
 * No ports, so the demand-driven walk never reaches it and it contributes
 * nothing to the shader. It is documentation that lives with the graph rather
 * than beside it.
 */
export const annotationNodes: readonly EffectNodeDefinition[] = [
  defineNode({
    type: COMMENT_NODE_TYPE,
    label: 'Comment',
    category: 'utility',
    description:
      'A note in the workspace. Explains the effect to whoever opens it next.',
    inputs: [],
    outputs: [],
    // Never called: with no outputs, nothing can wire to this node, so the
    // walk from the Output has no way to arrive here.
    emit: () => ({}),
  }),
];
