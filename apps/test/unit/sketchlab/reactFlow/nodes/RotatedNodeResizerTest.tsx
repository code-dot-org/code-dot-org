// Asserts the resizer's rendered DOM shape (handle count, interaction
// classes, aria), which requires querying by class name.
/* eslint-disable no-restricted-properties */
import {render} from '@testing-library/react';
import {ReactFlow, ReactFlowProvider} from '@xyflow/react';
import React from 'react';

import ShapeNode from '@cdo/apps/sketchlab/reactFlow/nodes/ShapeNode';
import {SketchLabNode} from '@cdo/apps/sketchlab/reactFlow/types';

const NODE_TYPES = {shape: ShapeNode};

function renderShapeFlow(nodeOverrides: Partial<SketchLabNode> = {}) {
  const node = {
    id: 'shape-1',
    type: 'shape',
    position: {x: 0, y: 0},
    width: 160,
    height: 120,
    data: {shapeType: 'rectangle', label: 'Box'},
    ...nodeOverrides,
  } as SketchLabNode;
  return render(
    <div style={{width: 800, height: 600}}>
      <ReactFlowProvider>
        <ReactFlow nodes={[node]} edges={[]} nodeTypes={NODE_TYPES} />
      </ReactFlowProvider>
    </div>
  );
}

describe('RotatedNodeResizer', () => {
  it('renders 8 resize handles inside the rotated wrapper when selected', () => {
    const {container} = renderShapeFlow({selected: true});
    const handles = container.querySelectorAll('.rotatable .handle');
    expect(handles).toHaveLength(8);
  });

  it('renders no resizer when the node is not selected', () => {
    const {container} = renderShapeFlow({selected: false});
    expect(container.querySelector('.resizer')).toBeNull();
  });

  it('renders no resizer when the node is locked', () => {
    const {container} = renderShapeFlow({
      selected: true,
      data: {shapeType: 'rectangle', label: 'Box', locked: true},
    });
    expect(container.querySelector('.resizer')).toBeNull();
  });

  it('opts handles out of node drag and canvas pan', () => {
    const {container} = renderShapeFlow({selected: true});
    container.querySelectorAll('.handle').forEach(handle => {
      expect(handle.classList.contains('nodrag')).toBe(true);
      expect(handle.classList.contains('nopan')).toBe(true);
    });
  });

  it('is hidden from screen readers and not keyboard-focusable', () => {
    const {container} = renderShapeFlow({selected: true});
    const resizer = container.querySelector('.resizer');
    expect(resizer?.getAttribute('aria-hidden')).toBe('true');
    container.querySelectorAll('.handle').forEach(handle => {
      expect(handle.hasAttribute('tabindex')).toBe(false);
    });
  });

  it('rotates the wrapper containing content, resizer, and connection handles', () => {
    const {container} = renderShapeFlow({
      selected: true,
      data: {shapeType: 'rectangle', label: 'Box', rotation: 45},
    });
    const rotatable = container.querySelector<HTMLElement>('.rotatable');
    expect(rotatable?.style.transform).toBe('rotate(45deg)');
    expect(rotatable?.querySelector('.resizer')).not.toBeNull();
    // Connection handles must live inside the rotated wrapper so they rotate
    // with the node rather than staying axis-aligned.
    expect(rotatable?.querySelector('.react-flow__handle')).not.toBeNull();
  });
});
