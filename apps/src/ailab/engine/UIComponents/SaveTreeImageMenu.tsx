import {
  ActionDropdown,
  type ActionDropdownProps,
} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useToast} from '@code-dot-org/component-library/toast';
import {Tooltip} from '@mui/material';
import React, {type RefObject, useState} from 'react';

import {captureTreeImage, downloadImage} from '../helpers/treeImage';

export type SaveImageToBackpack = (
  image: Blob,
  baseName: string
) => Promise<void>;

const LABEL = 'Save image';
const SAVE_ERROR = "Couldn't save an image of your tree. Please try again.";

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
  // Overlapping captures would each restore the other's temporary styles as originals.
  const [saving, setSaving] = useState(false);

  const saveImage = async (save: (image: Blob) => void | Promise<void>) => {
    setSaving(true);
    try {
      await save(await captureTreeImage(treeRef.current!));
    } catch (error) {
      console.error('AI Lab could not save an image of the tree.', error);
      showToast(SAVE_ERROR, {type: 'danger'});
    } finally {
      setSaving(false);
    }
  };

  const options: ActionDropdownProps['options'] = [
    {
      value: 'device',
      label: 'Save to device',
      icon: {iconName: 'download'},
      onClick: () =>
        saveImage(image => downloadImage(image, `${baseName}.png`)),
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
      <span>
        <ActionDropdown
          name="ailab-save-tree-image"
          labelText={LABEL}
          options={options}
          size="xs"
          menuVerticalPlacement="top"
          disabled={saving}
          triggerButtonProps={{
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
