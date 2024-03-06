import React from 'react';

import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import styles from '../model-customization-workspace.module.scss';

const INPUTS = [
  {id: 'intended-uses', text: 'Intended Uses'},
  {id: 'limitations-and-warnings', text: 'Limitations and Warnings'},
  {id: 'testing-and-evaluation', text: 'Testing and Evaluation'},
];

const PublishNotes: React.FunctionComponent = () => {
  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        {INPUTS.map(input => {
          return (
            <div className={styles.inputContainer}>
              <label htmlFor={input.id}>
                <StrongText>{input.text}</StrongText>
              </label>
              <textarea id={input.id} />
            </div>
          );
        })}
      </div>
      <div className={styles.footerButtonContainer}>
        <button type="button">Publish</button>
      </div>
    </div>
  );
};

export default PublishNotes;
