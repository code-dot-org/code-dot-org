import React from 'react';

import {ColorSwatch} from '../toolbarPalettes';

import TransparentSwatchIcon from './TransparentSwatchIcon';

import styles from './color-preview-swatch.module.scss';

interface ColorPreviewSwatchProps {
  value: string | undefined;
  swatches: ColorSwatch[];
}

// Small square swatch shown inside a dropdown trigger to preview the
// current color choice.
export default function ColorPreviewSwatch({
  value,
  swatches,
}: ColorPreviewSwatchProps) {
  const match = swatches.find(swatch => swatch.value === value);
  const isTransparent = match?.transparent === true;
  return (
    <span
      aria-hidden="true"
      className={styles.dropdownPreviewSwatch}
      style={isTransparent ? undefined : {backgroundColor: value}}
    >
      {isTransparent && <TransparentSwatchIcon />}
    </span>
  );
}
