import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import {DEFAULT_ROTATION} from '../constants';
import {ShapeNodeType} from '../types';

import ColorPickerPopover from './ColorPickerPopover';
import ColorPreviewSwatch from './ColorPreviewSwatch';
import FontSizeCustomInput from './FontSizeCustomInput';
import LockedNotice from './LockedNotice';
import NodeActionsGroup from './NodeActionsGroup';
import OptionListPopover from './OptionListPopover';
import RotationGroup from './RotationGroup';
import ToolbarDropdownRow from './ToolbarDropdownRow';
import {
  BACKGROUND_PALETTE,
  ColorSwatch,
  colorLabel,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_STROKE_COLOR,
  DEFAULT_TEXT_ALIGN,
  FONT_SIZE_OPTIONS,
  FontSize,
  fontSizeLabel,
  STROKE_FONT_PALETTE,
  TEXT_ALIGN_OPTIONS,
  TextAlignValue,
  textAlignLabel,
} from './toolbarPalettes';
import ToolbarSection from './ToolbarSection';
import ToolbarShell from './ToolbarShell';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ShapeNodeToolbarProps {
  nodeId: string;
}

const FONT_SIZE_OPTION_ITEMS = FONT_SIZE_OPTIONS.map(option => ({
  value: option.value,
  label: option.label,
}));

const TEXT_ALIGN_OPTION_ITEMS = TEXT_ALIGN_OPTIONS.map(option => ({
  value: option.value,
  label: option.label,
  icon: option.icon,
}));

function findTextAlignIcon(value: TextAlignValue): string {
  return (
    TEXT_ALIGN_OPTIONS.find(option => option.value === value)?.icon ??
    'align-center'
  );
}

export default function ShapeNodeToolbar({nodeId}: ShapeNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<ShapeNodeType>(nodeId);
  const {theme} = useTheme();
  const isDarkMode = theme === 'Dark';

  const {backgroundColor, strokeColor, fontSize, fontColor, textAlign} = data;
  const handlesVisible = data.showHandles !== false;

  const resolvedBackground = backgroundColor ?? DEFAULT_BACKGROUND_COLOR;
  const resolvedStroke = strokeColor ?? DEFAULT_STROKE_COLOR;
  const resolvedFontColor = fontColor ?? DEFAULT_FONT_COLOR;
  const resolvedFontSize: FontSize = fontSize ?? DEFAULT_FONT_SIZE;
  const resolvedAlign: TextAlignValue = textAlign ?? DEFAULT_TEXT_ALIGN;
  const fontSizeIsCustom = typeof resolvedFontSize === 'number';

  const renderColorRow = (
    label: string,
    swatches: ColorSwatch[],
    value: string,
    onSelect: (next: string) => void
  ) => (
    <ToolbarDropdownRow
      label={label}
      popoverRole="dialog"
      triggerPreview={<ColorPreviewSwatch value={value} swatches={swatches} />}
      triggerLabel={colorLabel(value, swatches, isDarkMode)}
      renderPopoverContent={closePopover => (
        <ColorPickerPopover
          groupLabel={label}
          swatches={swatches}
          selectedValue={value}
          onSelect={onSelect}
          onClose={closePopover}
        />
      )}
    />
  );

  return (
    <ToolbarShell
      target={{type: 'node', id: nodeId}}
      title="Shape"
      ariaLabel="Shape style"
    >
      {data.locked ? (
        <LockedNotice onUnlock={() => patchNodeData({locked: false})} />
      ) : (
        <>
          <ToolbarSection title="Appearance">
            {renderColorRow(
              'Background',
              BACKGROUND_PALETTE,
              resolvedBackground,
              next => patchNodeData({backgroundColor: next})
            )}
            {renderColorRow(
              'Border',
              STROKE_FONT_PALETTE,
              resolvedStroke,
              next => patchNodeData({strokeColor: next})
            )}
          </ToolbarSection>
          <ToolbarSection title="Text">
            <ToolbarDropdownRow
              label="Size"
              triggerPreview={
                <FontAwesomeV6Icon iconName="text-height" iconStyle="solid" />
              }
              triggerLabel={fontSizeLabel(resolvedFontSize)}
              renderPopoverContent={closePopover => (
                <OptionListPopover<FontSize>
                  ariaLabel="Size"
                  options={FONT_SIZE_OPTION_ITEMS}
                  selectedValue={
                    fontSizeIsCustom ? undefined : resolvedFontSize
                  }
                  onSelect={next => patchNodeData({fontSize: next})}
                  onClose={closePopover}
                  customRow={
                    <FontSizeCustomInput
                      selectedValue={resolvedFontSize}
                      onSelect={next => patchNodeData({fontSize: next})}
                      isSelected={fontSizeIsCustom}
                    />
                  }
                />
              )}
            />
            <ToolbarDropdownRow
              label="Alignment"
              triggerPreview={
                <FontAwesomeV6Icon
                  iconName={findTextAlignIcon(resolvedAlign)}
                  iconStyle="solid"
                />
              }
              triggerLabel={textAlignLabel(resolvedAlign)}
              renderPopoverContent={closePopover => (
                <OptionListPopover<TextAlignValue>
                  ariaLabel="Alignment"
                  options={TEXT_ALIGN_OPTION_ITEMS}
                  selectedValue={resolvedAlign}
                  onSelect={next => patchNodeData({textAlign: next})}
                  onClose={closePopover}
                />
              )}
            />
            {renderColorRow(
              'Color',
              STROKE_FONT_PALETTE,
              resolvedFontColor,
              next => patchNodeData({fontColor: next})
            )}
          </ToolbarSection>
          <RotationGroup
            value={data.rotation ?? DEFAULT_ROTATION}
            onChange={degrees => patchNodeData({rotation: degrees})}
          />
          <NodeActionsGroup
            nodeId={nodeId}
            handlesVisible={handlesVisible}
            onToggleHandles={() =>
              patchNodeData({showHandles: !handlesVisible})
            }
          />
        </>
      )}
    </ToolbarShell>
  );
}
