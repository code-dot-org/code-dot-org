import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useNodesData, useReactFlow} from '@xyflow/react';
import React, {useMemo} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {DEFAULT_ROTATION} from '../constants';
import {useClipboard, usePushSnapshot} from '../context';
import {ArrowHeadValue, LineAnchorNodeType} from '../types';
import {getStandaloneLineAnchorIds} from '../utils/lineAnchors';
import {newBackZIndex, newFrontZIndex} from '../utils/stacking';

import LockedNotice from './components/LockedNotice';
import OptionListDropdownRow from './components/OptionListDropdownRow';
import ToolbarSection from './components/ToolbarSection';
import ToolbarShell from './components/ToolbarShell';
import ActionsGroup from './sections/ActionsGroup';
import ColorDropdownRow from './sections/ColorDropdownRow';
import RotationGroup from './sections/RotationGroup';
import {
  ARROW_HEAD_OPTIONS,
  DEFAULT_EDGE_TYPE,
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
  EdgeTypeValue,
  EDGE_TYPE_OPTIONS,
  LineStrokeStyleValue,
  LINE_STROKE_STYLE_OPTIONS,
  LINE_WIDTH_OPTIONS,
  strokeStyleFromDasharray,
  STROKE_FONT_PALETTE,
} from './toolbarPalettes';

interface LineEdgeToolbarProps {
  edge: SketchlabReactFlowEdge;
  onSelectColor: (value: string) => void;
  onSelectWidth: (value: number) => void;
  onSelectStrokeStyle: (value: LineStrokeStyleValue) => void;
  onSelectEdgeType: (value: EdgeTypeValue) => void;
  onSelectArrowHeads: (value: ArrowHeadValue) => void;
  onSelectRotation: (value: number) => void;
  onSetLocked: (value: boolean) => void;
}

export default function LineEdgeToolbar({
  edge,
  onSelectColor,
  onSelectWidth,
  onSelectStrokeStyle,
  onSelectEdgeType,
  onSelectArrowHeads,
  onSelectRotation,
  onSetLocked,
}: LineEdgeToolbarProps) {
  const {
    deleteElements,
    updateEdge,
    updateNodeData,
    getNode,
    getNodes,
    getEdges,
  } = useReactFlow();
  const pushSnapshot = usePushSnapshot();

  const isLocked = edge.data?.locked === true;

  const endpointInfo = useNodesData<LineAnchorNodeType>([
    edge.source,
    edge.target,
  ]);
  const anchorEndpoints = endpointInfo.filter(
    (n): n is LineAnchorNodeType => !!n && n.type === 'lineAnchor'
  );

  // The edge holds the handle visibility preference so it survives attach/detach cycles.
  const handlesVisible = edge.data?.showHandles ?? true;
  const hasAnchors = anchorEndpoints.length > 0;
  const onToggleHandles = () => {
    const next = !handlesVisible;
    pushSnapshot();
    updateEdge(edge.id, {data: {...edge.data, showHandles: next}});
    anchorEndpoints.forEach(n => updateNodeData(n.id, {showHandles: next}));
  };

  const selectedColor =
    (typeof edge.style?.stroke === 'string' && edge.style.stroke) ||
    DEFAULT_STROKE_COLOR;

  const widthOption = useMemo(() => {
    const width = Number(edge.style?.strokeWidth);
    return (
      LINE_WIDTH_OPTIONS.find(option => option.value === width) ??
      LINE_WIDTH_OPTIONS.find(option => option.value === DEFAULT_LINE_WIDTH)!
    );
  }, [edge.style?.strokeWidth]);

  const strokeStyleOption = useMemo(() => {
    const style = strokeStyleFromDasharray(edge.style?.strokeDasharray);
    return LINE_STROKE_STYLE_OPTIONS.find(option => option.value === style)!;
  }, [edge.style?.strokeDasharray]);

  const edgeTypeOption = useMemo(
    () =>
      EDGE_TYPE_OPTIONS.find(option => option.value === edge.type) ??
      EDGE_TYPE_OPTIONS.find(option => option.value === DEFAULT_EDGE_TYPE)!,
    [edge.type]
  );

  const arrowHeadOption = useMemo(() => {
    const hasStart = !!edge.markerStart;
    const hasEnd = !!edge.markerEnd;
    let value: ArrowHeadValue;
    if (hasStart && hasEnd) value = 'both';
    else if (hasStart) value = 'start';
    else if (hasEnd) value = 'end';
    else value = 'none';
    return ARROW_HEAD_OPTIONS.find(option => option.value === value)!;
  }, [edge.markerStart, edge.markerEnd]);
  const isFullyDetachedLine = !!getStandaloneLineAnchorIds(
    edge,
    id => getNode(id) as SketchlabReactFlowNode | undefined
  );

  const {duplicateLine} = useClipboard();

  return (
    <ToolbarShell
      target={{type: 'edge', id: edge.id}}
      title="Line"
      ariaLabel="Line style"
    >
      {isLocked ? (
        <LockedNotice onUnlock={() => onSetLocked(false)} />
      ) : (
        <>
          <ToolbarSection title="Appearance">
            <ColorDropdownRow
              label="Color"
              swatches={STROKE_FONT_PALETTE}
              value={selectedColor}
              onSelect={onSelectColor}
            />
            <OptionListDropdownRow
              label="Thickness"
              triggerIcon={
                <FontAwesomeV6Icon
                  iconName="line-weight"
                  iconStyle="solid"
                  iconFamily="kit"
                />
              }
              options={LINE_WIDTH_OPTIONS}
              selectedOption={widthOption}
              onSelect={onSelectWidth}
            />
            <OptionListDropdownRow
              label="Style"
              triggerIcon={
                <FontAwesomeV6Icon
                  iconName="line-style"
                  iconStyle="solid"
                  iconFamily="kit"
                />
              }
              options={LINE_STROKE_STYLE_OPTIONS}
              selectedOption={strokeStyleOption}
              onSelect={onSelectStrokeStyle}
            />
            <OptionListDropdownRow
              label="Shape"
              triggerIcon={
                <FontAwesomeV6Icon
                  iconName="line-shape"
                  iconStyle="solid"
                  iconFamily="kit"
                />
              }
              options={EDGE_TYPE_OPTIONS}
              selectedOption={edgeTypeOption}
              onSelect={onSelectEdgeType}
            />
            <OptionListDropdownRow
              label="Arrowheads"
              triggerIcon={
                <FontAwesomeV6Icon
                  iconName="arrow-right-arrow-left"
                  iconStyle="solid"
                />
              }
              options={ARROW_HEAD_OPTIONS}
              selectedOption={arrowHeadOption}
              onSelect={onSelectArrowHeads}
            />
          </ToolbarSection>
          <RotationGroup
            value={edge.data?.rotation ?? DEFAULT_ROTATION}
            onChange={onSelectRotation}
            disabled={!isFullyDetachedLine}
          />
          <ActionsGroup
            onDelete={() => deleteElements({edges: [{id: edge.id}]})}
            onLock={() => onSetLocked(true)}
            onDuplicate={() => duplicateLine(edge.id)}
            onBringToFront={() => {
              const items = [...getNodes(), ...getEdges()];
              updateEdge(edge.id, {zIndex: newFrontZIndex(items, edge.id)});
            }}
            onSendToBack={() => {
              const items = [...getNodes(), ...getEdges()];
              updateEdge(edge.id, {zIndex: newBackZIndex(items, edge.id)});
            }}
            handlesToggle={
              hasAnchors
                ? {visible: handlesVisible, onToggle: onToggleHandles}
                : undefined
            }
          />
        </>
      )}
    </ToolbarShell>
  );
}
