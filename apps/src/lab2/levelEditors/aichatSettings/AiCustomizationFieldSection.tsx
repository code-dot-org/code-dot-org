import classNames from 'classnames';
import React, {useContext} from 'react';

import {AiCustomizations} from '@cdo/apps/aichat/types';
import {BodyFourText} from '@cdo/apps/componentLibrary/typography';

import {UpdateContext} from './UpdateContext';
import VisibilityDropdown from './VisibilityDropdown';

import moduleStyles from './edit-aichat-settings.module.scss';

interface AiCustomizationFieldSectionProps {
  fieldName: keyof AiCustomizations;
  description?: string;
  inputType: 'text' | 'number' | 'textarea' | 'custom';
  inputNode?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}

const AiCustomizationFieldSection: React.FunctionComponent<
  AiCustomizationFieldSectionProps
> = ({fieldName, description, inputType, inputNode, min, max, step}) => {
  const {aichatSettings, setPropertyValue} = useContext(UpdateContext);
  const InputTag = inputType === 'textarea' ? 'textarea' : 'input';
  const {initialCustomizations, visibilities} = aichatSettings;
  return (
    <>
      {description && (
        <BodyFourText>
          <i>{description}</i>
        </BodyFourText>
      )}
      <div className={moduleStyles.fieldRow}>
        <div className={moduleStyles['field-value']}>
          <label htmlFor={fieldName}>Initial Value(s)</label>
          {inputType === 'custom' && inputNode ? (
            inputNode
          ) : (
            <InputTag
              id={fieldName}
              type={inputType}
              value={initialCustomizations[fieldName] as string | number}
              onChange={e => setPropertyValue(fieldName, e.target.value)}
              className={classNames(
                inputType === 'textarea' && moduleStyles.textarea
              )}
              {...(inputType === 'number' && {min, max, step})}
            />
          )}
        </div>
        <VisibilityDropdown
          value={visibilities[fieldName]}
          property={fieldName}
        />
      </div>
    </>
  );
};

export default AiCustomizationFieldSection;
