// A schema form widget for a destination's color: a swatch for each color
// family, drawn as the map draws destinations, with its name.

import classNames from 'classnames';
import React from 'react';

import {WidgetProps} from '@cdo/apps/lab2/levelEditors/schemaForm/SchemaForm';

import {DESTINATION_COLORS} from '../schema/destination';

import styles from './destination-color-widget.module.scss';

/** The widget name the destination schema gives its color. */
export const DESTINATION_COLOR_WIDGET = 'destinationColor';

const DestinationColorWidget: React.FunctionComponent<WidgetProps> = ({
  value,
  onChange,
  path,
}) => (
  <div
    className={styles.swatches}
    role="radiogroup"
    aria-label="Color"
    id={`schema-field-${path.join('-')}`}
  >
    {[undefined, ...DESTINATION_COLORS].map(color => (
      <button
        key={color ?? 'none'}
        type="button"
        role="radio"
        aria-checked={value === color}
        className={classNames(
          styles.swatch,
          color && styles[color],
          value === color && styles.chosen
        )}
        onClick={() => onChange(color)}
      >
        <span className={styles.chip} aria-hidden="true" />
        {color ?? 'Not set'}
      </button>
    ))}
  </div>
);

export default DestinationColorWidget;
