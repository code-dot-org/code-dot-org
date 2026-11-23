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

export type SaveImageToBackpack = (
  image: Blob,
  baseName: string
) => Promise<void>;

const LABEL = 'Save image';
const SAVE_ERROR = "Couldn't save an image of your tree. Please try again.";

// The dropdown keeps its open state private, so we read and toggle it through its button.
const isMenuOpen = (trigger: HTMLButtonElement) =>
  trigger.hasAttribute('data-force-hover');
const closeMenu = (trigger: HTMLButtonElement) => trigger.click();

interface SaveTreeImageMenuProps {
  treeRef: RefObject<HTMLElement>;
  baseName: string;
  saveToBackpack?: SaveImageToBackpack;
  tabbable: boolean;
}

const SaveTreeImageMenu = ({
  treeRef,
  baseName,
  saveToBackpack,
  tabbable,
}: SaveTreeImageMenuProps) => {
  const showToast = useToast();
  const menuRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The dropdown closes on a mousedown outside it, but the tree's pan and zoom swallow those.
  useEffect(() => {
    const closeOnPressOutside = ({target}: PointerEvent) => {
      const trigger = triggerRef.current!;
      if (isMenuOpen(trigger) && !menuRef.current!.contains(target as Node)) {
        closeMenu(trigger);
      }
    };
    document.addEventListener('pointerdown', closeOnPressOutside);
    return () =>
      document.removeEventListener('pointerdown', closeOnPressOutside);
  }, []);

  const saveImage = async (save: (image: Blob) => void | Promise<void>) => {
    // An ActionDropdown stays open after a choice.
    closeMenu(triggerRef.current!);
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
  if (saveToBackpack) {
    options.push({
      value: 'backpack',
      label: 'Save to Backpack',
      icon: {iconName: 'backpack'},
      onClick: () => saveImage(image => saveToBackpack(image, baseName)),
    });
  }

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
