import {useTheme} from '@code-dot-org/component-library/common/contexts';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import {DEFAULT_ROTATION} from '../constants';
import {TextNodeType} from '../types';

import ColorPickerPopover from './ColorPickerPopover';
import ColorPreviewSwatch from './ColorPreviewSwatch';
import FontSizeCustomInput from './FontSizeCustomInput';
import LockedNotice from './LockedNotice';
import NodeActionsGroup from './NodeActionsGroup';
import OptionListPopover from './OptionListPopover';
import RotationGroup from './RotationGroup';
import ToolbarDropdownRow from './ToolbarDropdownRow';
import {
  colorLabel,
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
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

interface TextNodeToolbarProps {
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

export default function TextNodeToolbar({nodeId}: TextNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<TextNodeType>(nodeId);
  const {theme} = useTheme();
  const isDarkMode = theme === 'Dark';

  const {fontSize, fontColor, textAlign} = data;
  const handlesVisible = data.showHandles !== false;

  const resolvedFontSize: FontSize = fontSize ?? DEFAULT_FONT_SIZE;
  const resolvedFontColor = fontColor ?? DEFAULT_FONT_COLOR;
  const resolvedAlign: TextAlignValue = textAlign ?? DEFAULT_TEXT_ALIGN;
  const fontSizeIsCustom = typeof resolvedFontSize === 'number';

  return (
    <ToolbarShell
      target={{type: 'node', id: nodeId}}
      title="Text"
      ariaLabel="Text style"
    >
      {data.locked ? (
        <LockedNotice onUnlock={() => patchNodeData({locked: false})} />
      ) : (
        <>
          <ToolbarSection title="Appearance">
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
            <ToolbarDropdownRow
              label="Color"
              popoverRole="dialog"
              triggerPreview={
                <ColorPreviewSwatch
                  value={resolvedFontColor}
                  swatches={STROKE_FONT_PALETTE}
                />
              }
              triggerLabel={colorLabel(
                resolvedFontColor,
                STROKE_FONT_PALETTE,
                isDarkMode
              )}
              renderPopoverContent={closePopover => (
                <ColorPickerPopover
                  groupLabel="Color"
                  swatches={STROKE_FONT_PALETTE}
                  selectedValue={resolvedFontColor}
                  onSelect={next => patchNodeData({fontColor: next})}
                  onClose={closePopover}
                />
              )}
            />
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
