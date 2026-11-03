import {
  ActionDropdown,
  type ActionDropdownProps,
} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useToast} from '@code-dot-org/component-library/toast';
import {Tooltip} from '@mui/material';
import React, {type RefObject, useEffect, useRef} from 'react';

import {downloadBlobAsPng} from '@cdo/apps/imageUtils';

import {captureTreeImage} from '../helpers/treeImage';

const LABEL = 'Save image';
const SAVE_ERROR = "Couldn't save an image of your tree. Please try again.";

interface SaveTreeImageMenuProps {
  treeRef: RefObject<HTMLElement>;
  baseName: string;
  tabbable: boolean;
}

const SaveTreeImageMenu = ({
  treeRef,
  baseName,
  tabbable,
}: SaveTreeImageMenuProps) => {
  const showToast = useToast();
  const menuRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // d3-zoom stops mousedown on the tree, so CustomDropdown never hears a press there.
  useEffect(() => {
    const closeOnPressOutside = ({target}: PointerEvent) => {
      const trigger = triggerRef.current!;
      const open = trigger.hasAttribute('data-force-hover');
      if (open && !menuRef.current!.contains(target as Node)) {
        trigger.click();
      }
    };
    document.addEventListener('pointerdown', closeOnPressOutside);
    return () =>
      document.removeEventListener('pointerdown', closeOnPressOutside);
  }, []);

  const saveImage = async (save: (image: Blob) => void | Promise<void>) => {
    // ActionDropdown's own close never reaches the menu's private state.
    triggerRef.current!.click();
    triggerRef.current!.focus();
    try {
      await save(await captureTreeImage(treeRef.current!));
    } catch (error) {
      console.error('AI Lab could not save an image of the tree.', error);
      showToast(SAVE_ERROR, {type: 'danger'});
    }
  };

  const options: ActionDropdownProps['options'] = [
    {
      value: 'device',
      label: 'Save to device',
      icon: {iconName: 'download'},
      onClick: () =>
        saveImage(image => downloadBlobAsPng(image, `${baseName}.png`)),
    },
  ];

  return (
    <Tooltip title={LABEL} placement="right">
      <span ref={menuRef}>
        <ActionDropdown
          name="ailab-save-tree-image"
          labelText={LABEL}
          options={options}
          size="xs"
          menuVerticalPlacement="top"
          triggerButtonProps={{
            ref: triggerRef,
            color: 'tertiary',
            variant: 'text',
            size: 'extraSmall',
            tabIndex: tabbable ? 0 : -1,
            children: (
              <FontAwesomeV6Icon iconName="camera" aria-hidden="true" />
            ),
          }}
        />
      </span>
    </Tooltip>
  );
};

export default SaveTreeImageMenu;
