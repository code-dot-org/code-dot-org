import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useNodesData, useReactFlow} from '@xyflow/react';
import React, {useMemo} from 'react';

import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import {useClipboard, usePushSnapshot} from '../context';
import {ArrowHeadValue, LineAnchorNodeType} from '../types';
import {newBackZIndex, newFrontZIndex} from '../utils/stacking';

import ActionsGroup from './ActionsGroup';
import ColorPickerPopover from './ColorPickerPopover';
import ColorPreviewSwatch from './ColorPreviewSwatch';
import LockedNotice from './LockedNotice';
import OptionListPopover from './OptionListPopover';
import ToolbarDropdownRow from './ToolbarDropdownRow';
import {
  colorLabel,
  DEFAULT_EDGE_TYPE,
  DEFAULT_LINE_STROKE_STYLE,
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
  EdgeTypeValue,
  EDGE_TYPE_OPTIONS,
  LineStrokeStyleValue,
  LINE_STROKE_STYLE_OPTIONS,
  LINE_WIDTH_OPTIONS,
  LineWidthValue,
  strokeStyleFromDasharray,
  STROKE_FONT_PALETTE,
} from './toolbarPalettes';
import ToolbarSection from './ToolbarSection';
import ToolbarShell from './ToolbarShell';

import styles from './line-edge-toolbar.module.scss';

type LinePreviewStyle = 'solid' | 'dashed' | 'dotted';

const ARROW_HEAD_OPTIONS = [
  {value: 'none', label: 'None', icon: 'minus'},
  {value: 'start', label: 'Start', icon: 'arrow-left-long'},
  {value: 'end', label: 'End', icon: 'arrow-right-long'},
  {value: 'both', label: 'Both', icon: 'arrows-left-right'},
] as const;

const EDGE_TYPE_ICONS: Record<EdgeTypeValue, string> = {
  straight: 'minus',
  default: 'line-curve',
  smoothstep: 'line-step-round',
  step: 'line-step-sharp',
};

const STROKE_STYLE_LABELS: Record<LineStrokeStyleValue, string> =
  LINE_STROKE_STYLE_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {} as Record<LineStrokeStyleValue, string>);

const WIDTH_LABELS: Record<LineWidthValue, string> = LINE_WIDTH_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<LineWidthValue, string>
);

const EDGE_TYPE_LABELS: Record<EdgeTypeValue, string> =
  EDGE_TYPE_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {} as Record<EdgeTypeValue, string>);

function renderLinePreview(
  width: number,
  lineStyle: LinePreviewStyle
): React.ReactNode {
  return (
    <span
      aria-hidden="true"
      className={styles.linePreview}
      style={{
        borderTopWidth: width,
        borderTopStyle: lineStyle,
      }}
    />
  );
}

interface LineEdgeToolbarProps {
  edge: SketchlabReactFlowEdge;
  onSelectColor: (value: string) => void;
  onSelectWidth: (value: number) => void;
  onSelectStrokeStyle: (value: LineStrokeStyleValue) => void;
  onSelectEdgeType: (value: EdgeTypeValue) => void;
  onSelectArrowHeads: (value: ArrowHeadValue) => void;
  onSetLocked: (value: boolean) => void;
}

export default function LineEdgeToolbar({
  edge,
  onSelectColor,
  onSelectWidth,
  onSelectStrokeStyle,
  onSelectEdgeType,
  onSelectArrowHeads,
  onSetLocked,
}: LineEdgeToolbarProps) {
  const {deleteElements, updateEdge, updateNodeData, getNodes, getEdges} =
    useReactFlow();
  const pushSnapshot = usePushSnapshot();
  const {theme} = useTheme();
  const isDarkMode = theme === 'Dark';

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
  const selectedWidth = Number(edge.style?.strokeWidth);
  const selectedWidthValue = LINE_WIDTH_OPTIONS.some(
    option => option.value === selectedWidth
  )
    ? (selectedWidth as LineWidthValue)
    : DEFAULT_LINE_WIDTH;
  const selectedStrokeStyle = strokeStyleFromDasharray(
    edge.style?.strokeDasharray
  );
  const selectedStrokeStyleValue = LINE_STROKE_STYLE_OPTIONS.some(
    option => option.value === selectedStrokeStyle
  )
    ? selectedStrokeStyle
    : DEFAULT_LINE_STROKE_STYLE;
  const selectedEdgeTypeValue = EDGE_TYPE_OPTIONS.some(
    option => option.value === edge.type
  )
    ? (edge.type as EdgeTypeValue)
    : DEFAULT_EDGE_TYPE;

  const selectedArrowHeads = useMemo(() => {
    const hasStartArrow = !!edge.markerStart;
    const hasEndArrow = !!edge.markerEnd;
    if (hasStartArrow && hasEndArrow) {
      return 'both';
    } else if (hasStartArrow) {
      return 'start';
    } else if (hasEndArrow) {
      return 'end';
    } else {
      return 'none';
    }
  }, [edge.markerStart, edge.markerEnd]);

  const {duplicateLine} = useClipboard();

  const widthOptionItems = LINE_WIDTH_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
    preview: renderLinePreview(option.value, 'solid'),
  }));
  const strokeStyleOptionItems = LINE_STROKE_STYLE_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
    preview: renderLinePreview(2, option.value),
  }));
  const edgeTypeOptionItems = EDGE_TYPE_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
    icon: EDGE_TYPE_ICONS[option.value],
  }));
  const arrowHeadOptionItems = ARROW_HEAD_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
    icon: option.icon,
  }));

  const arrowHeadIcon =
    ARROW_HEAD_OPTIONS.find(option => option.value === selectedArrowHeads)
      ?.icon ?? 'minus';
  const arrowHeadLabel =
    ARROW_HEAD_OPTIONS.find(option => option.value === selectedArrowHeads)
      ?.label ?? 'None';

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
            <ToolbarDropdownRow
              label="Color"
              popoverRole="dialog"
              triggerPreview={
                <ColorPreviewSwatch
                  value={selectedColor}
                  swatches={STROKE_FONT_PALETTE}
                />
              }
              triggerLabel={colorLabel(
                selectedColor,
                STROKE_FONT_PALETTE,
                isDarkMode
              )}
              renderPopoverContent={closePopover => (
                <ColorPickerPopover
                  groupLabel="Color"
                  swatches={STROKE_FONT_PALETTE}
                  selectedValue={selectedColor}
                  onSelect={onSelectColor}
                  onClose={closePopover}
                />
              )}
            />
            <ToolbarDropdownRow
              label="Thickness"
              triggerPreview={renderLinePreview(selectedWidthValue, 'solid')}
              triggerLabel={WIDTH_LABELS[selectedWidthValue]}
              renderPopoverContent={closePopover => (
                <OptionListPopover<LineWidthValue>
                  ariaLabel="Thickness"
                  options={widthOptionItems}
                  selectedValue={selectedWidthValue}
                  onSelect={value => onSelectWidth(value)}
                  onClose={closePopover}
                />
              )}
            />
            <ToolbarDropdownRow
              label="Style"
              triggerPreview={renderLinePreview(2, selectedStrokeStyleValue)}
              triggerLabel={STROKE_STYLE_LABELS[selectedStrokeStyleValue]}
              renderPopoverContent={closePopover => (
                <OptionListPopover<LineStrokeStyleValue>
                  ariaLabel="Style"
                  options={strokeStyleOptionItems}
                  selectedValue={selectedStrokeStyleValue}
                  onSelect={value => onSelectStrokeStyle(value)}
                  onClose={closePopover}
                />
              )}
            />
            <ToolbarDropdownRow
              label="Shape"
              triggerPreview={
                <FontAwesomeV6Icon
                  iconName={EDGE_TYPE_ICONS[selectedEdgeTypeValue]}
                />
              }
              triggerLabel={EDGE_TYPE_LABELS[selectedEdgeTypeValue]}
              renderPopoverContent={closePopover => (
                <OptionListPopover<EdgeTypeValue>
                  ariaLabel="Shape"
                  options={edgeTypeOptionItems}
                  selectedValue={selectedEdgeTypeValue}
                  onSelect={value => onSelectEdgeType(value)}
                  onClose={closePopover}
                />
              )}
            />
            <ToolbarDropdownRow
              label="Arrowheads"
              triggerPreview={<FontAwesomeV6Icon iconName={arrowHeadIcon} />}
              triggerLabel={arrowHeadLabel}
              renderPopoverContent={closePopover => (
                <OptionListPopover<ArrowHeadValue>
                  ariaLabel="Arrowheads"
                  options={arrowHeadOptionItems}
                  selectedValue={selectedArrowHeads}
                  onSelect={value => onSelectArrowHeads(value)}
                  onClose={closePopover}
                />
              )}
            />
          </ToolbarSection>
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
