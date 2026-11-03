import {
  ActionDropdown,
  type ActionDropdownProps,
} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useToast} from '@code-dot-org/component-library/toast';
import {Tooltip} from '@mui/material';
import React, {
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useRef,
} from 'react';

import {downloadBlobAsPng} from '@cdo/apps/imageUtils';

import {captureTreeImage} from '../helpers/treeImage';

const LABEL = 'Save image';
const SAVE_ERROR = "Couldn't save an image of your tree. Please try again.";

// CustomDropdown closes only on a mousedown outside it.
const closeMenu = () =>
  document.body.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));

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

  // d3-zoom stops mousedown on the tree.
  useEffect(() => {
    const closeOnPressOutside = ({target}: PointerEvent) => {
      if (!menuRef.current!.contains(target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('pointerdown', closeOnPressOutside);
    return () =>
      document.removeEventListener('pointerdown', closeOnPressOutside);
  }, []);

  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }
    closeMenu();
    const fromMenu = event.target !== triggerRef.current;
    if (fromMenu) {
      event.stopPropagation();
      triggerRef.current!.focus();
    }
  };

  const saveImage = async (save: (image: Blob) => void | Promise<void>) => {
    closeMenu();
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
      <span ref={menuRef} onKeyDown={closeOnEscape}>
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
