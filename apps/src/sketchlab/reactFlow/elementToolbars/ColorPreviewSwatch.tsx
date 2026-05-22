import classNames from 'classnames';
import React from 'react';

import {ColorSwatch} from './toolbarPalettes';

import styles from './element-toolbar.module.scss';

interface ColorPreviewSwatchProps {
  value: string | undefined;
  swatches: ColorSwatch[];
}

// Small square swatch shown inside a dropdown trigger to preview the
// current color choice. Handles the transparent-pattern variant when the
// selected swatch is the transparent entry in the palette.
export default function ColorPreviewSwatch({
  value,
  swatches,
}: ColorPreviewSwatchProps) {
  const match = swatches.find(swatch => swatch.value === value);
  const isTransparent = match?.transparent === true;
  return (
    <span
      aria-hidden="true"
      className={classNames(styles.dropdownPreviewSwatch, {
        [styles.swatchTransparent]: isTransparent,
      })}
      style={isTransparent ? undefined : {backgroundColor: value}}
    />
  );
}
