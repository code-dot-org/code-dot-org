import PropTypes from 'prop-types';
import React, {useEffect} from 'react';

import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';

import styles from './edit-child-level-settings.module.scss';

const BubbleChoiceDescriptionEditor = ({
  description,
  index,
  handleDescriptionChange,
}) => {
  useEffect(() => {
    const elementId = `bubble_choice_description_${index}`;
    const element = document.getElementById(elementId);
    if (element) {
      initializeCodeMirror(elementId, 'markdown');
    } else {
      console.error(`Element with ID ${elementId} not found.`);
    }
  }, [index]);

  return (
    <div className={styles.fieldRow}>
      <label>Description</label>
      <textarea
        id={`bubble_choice_description_${index}`}
        value={description}
        onChange={e => handleDescriptionChange(index, e.target.value)}
        className={styles.bubbleChoiceSublevelMarkdown}
      />
      <div
        id={`bubble_choice_description_${index}_preview`}
        className={styles.bubbleChoiceDescriptionPreview}
      />
    </div>
  );
};

BubbleChoiceDescriptionEditor.propTypes = {
  description: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  handleDescriptionChange: PropTypes.func.isRequired,
};

export default BubbleChoiceDescriptionEditor;
