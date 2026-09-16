import React, {ChangeEvent, FC} from 'react';

import {DrawingObjectRecord} from './types';

import styles from './svg-canvas.module.scss';

interface PropertyPanelProps {
  selected: DrawingObjectRecord | null;
  onDescriptionChange: (description: string) => void;
}

// Shows when an object is selected. The description field is what screen
// readers announce when a student navigates to the object in the accessible
// object list or in the exported SVG.
const PropertyPanel: FC<PropertyPanelProps> = ({
  selected,
  onDescriptionChange,
}) => {
  if (!selected) return null;

  return (
    <div className={styles.propertyPanel}>
      <label htmlFor="svg-canvas-description" className={styles.propertyLabel}>
        Object description (read aloud by screen readers)
      </label>
      <input
        id="svg-canvas-description"
        type="text"
        value={selected.description}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onDescriptionChange(e.target.value)
        }
        placeholder="Describe this object…"
        className={styles.propertyInput}
        aria-describedby="svg-canvas-description-hint"
      />
      <p id="svg-canvas-description-hint" className={styles.propertyHint}>
        Example: "a red circle in the upper right corner"
      </p>
    </div>
  );
};

export default PropertyPanel;
