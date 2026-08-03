// This suite exists to assert the exact class names React Flow renders, so it
// must query the DOM by class name — the usual "query by role/text" guidance
// does not apply.
/* eslint-disable no-restricted-properties */
import {render} from '@testing-library/react';
import {
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import React from 'react';

import {
  REACT_FLOW_CLASS,
  reactFlowNodeTypeClass,
} from '@cdo/apps/sketchlab/reactFlow/reactFlowSelectors';

/**
 * Drift guard for the @xyflow/react class names and data-attributes our code
 * queries against.
 *
 * The selectors in reactFlowSelectors.ts hard-code names the library emits but
 * does not document as public API. This test renders a live flow and asserts
 * the rendered DOM still uses them, so a library upgrade that renames them
 * fails here instead of silently breaking focus, snapping, snapshot export,
 * and toolbar positioning in production.
 *
 * jsdom can't run React Flow's measurement pipeline (no real layout), so an
 * individual `react-flow__edge` wrapper never mounts. We assert the edge layer
 * (`react-flow__edges`) instead, which carries the same prefix and `edge`
 * token. The singular wrapper class is not directly covered by any test today;
 * a rename of just that token (with `react-flow__edges` left intact) would slip
 * through here.
 *
 * The `nodrag` / `nopan` / `nowheel` interaction classes are inputs React Flow
 * reads off our elements rather than DOM it renders, so there is nothing to
 * assert for them here.
 */

// The edge layer container; see the file comment for why we assert this rather
// than the per-edge `react-flow__edge` wrapper.
const REACT_FLOW_EDGE_LAYER_CLASS = 'react-flow__edges';

// A node that renders source and target handles, so the rendered DOM exercises
// REACT_FLOW_CLASS.handle and the `react-flow__node-<type>` variant.
const PROBE_NODE_TYPE = 'probe';
function ProbeNode(_props: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div>probe</div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

const NODE_TYPES = {[PROBE_NODE_TYPE]: ProbeNode};

const NODES: Node[] = [
  {id: 'a', type: PROBE_NODE_TYPE, position: {x: 0, y: 0}, data: {}},
  {id: 'b', type: PROBE_NODE_TYPE, position: {x: 0, y: 200}, data: {}},
];

const EDGES = [{id: 'a-b', source: 'a', target: 'b'}];

function renderProbeFlow() {
  return render(
    <div style={{width: 800, height: 600}}>
      <ReactFlowProvider>
        <ReactFlow nodes={NODES} edges={EDGES} nodeTypes={NODE_TYPES}>
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

describe('reactFlowSelectors', () => {
  it('matches the class names @xyflow/react renders', () => {
    const {container} = renderProbeFlow();
    const present = (className: string) =>
      container.querySelector(`.${className}`);

    expect(present(REACT_FLOW_CLASS.container)).not.toBeNull();
    expect(present(REACT_FLOW_CLASS.viewport)).not.toBeNull();
    expect(present(REACT_FLOW_CLASS.node)).not.toBeNull();
    expect(present(REACT_FLOW_CLASS.handle)).not.toBeNull();
    expect(present(REACT_FLOW_CLASS.controls)).not.toBeNull();
    expect(present(REACT_FLOW_CLASS.controlsButton)).not.toBeNull();
    expect(present(reactFlowNodeTypeClass(PROBE_NODE_TYPE))).not.toBeNull();
    expect(present(REACT_FLOW_EDGE_LAYER_CLASS)).not.toBeNull();
  });

  it('puts data-id on the node wrapper', () => {
    const {container} = renderProbeFlow();
    expect(
      container.querySelector(`.${REACT_FLOW_CLASS.node}[data-id="a"]`)
    ).not.toBeNull();
  });

  it('puts data-nodeid on handles', () => {
    const {container} = renderProbeFlow();
    expect(
      container.querySelector(`.${REACT_FLOW_CLASS.handle}[data-nodeid="a"]`)
    ).not.toBeNull();
  });
});
