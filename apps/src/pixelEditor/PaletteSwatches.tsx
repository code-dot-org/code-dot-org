import classNames from 'classnames';
import React from 'react';

import {PaletteColor} from './PixelEditor';
import {RGBA} from './tools';

import moduleStyles from './pixel-editor.module.scss';

interface PaletteSwatchesProps {
  palette: readonly PaletteColor[];
  color: RGBA;
  onChange: (color: RGBA) => void;
}

/** A fixed palette as a row of round swatches, in place of the spectrum
    picker. */
const PaletteSwatches: React.FunctionComponent<PaletteSwatchesProps> = ({
  palette,
  color,
  onChange,
}) => (
  <div className={moduleStyles.palette} role="group" aria-label="Colors">
    {palette.map(swatch => {
      const active = swatch.rgba.every((v, i) => v === color[i]);
      return (
        <button
          key={swatch.name}
          type="button"
          aria-label={swatch.name}
          aria-pressed={active}
          className={classNames(
            moduleStyles.paletteSwatch,
            active && moduleStyles.paletteSwatchActive
          )}
          style={{
            backgroundColor: `rgb(${swatch.rgba[0]} ${swatch.rgba[1]} ${swatch.rgba[2]})`,
          }}
          onClick={() => onChange(swatch.rgba)}
        />
      );
    })}
  </div>
);

export default PaletteSwatches;
