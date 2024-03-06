import {AiCustomizations} from '@cdo/apps/aichat/types';
import React, {useContext} from 'react';
import {BodyFourText, BodyOneText} from '@cdo/apps/componentLibrary/typography';
import classNames from 'classnames';
import moduleStyles from './edit-ai-customizations.module.scss';
import VisibilityDropdown from './VisibilityDropdown';
import {UpdateContext} from './UpdateContext';

interface FieldSectionProps {
  fieldName: keyof AiCustomizations;
  labelText: string;
  description?: string;
  inputType: 'text' | 'number' | 'textarea' | 'custom';
  inputNode?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}

const FieldSection: React.FunctionComponent<FieldSectionProps> = ({
  fieldName,
  description,
  labelText,
  inputType,
  inputNode,
  min,
  max,
  step,
}) => {
  const {aiCustomizations, setPropertyValue} = useContext(UpdateContext);
  const InputTag = inputType === 'textarea' ? 'textarea' : 'input';
  return (
    <div className={moduleStyles.fieldSection}>
      <hr />
      <BodyOneText>{labelText}</BodyOneText>
      {description && (
        <BodyFourText>
          <i>{description}</i>
        </BodyFourText>
      )}
      <div className={moduleStyles.fieldRow}>
        <div className={moduleStyles.fieldValue}>
          <label htmlFor={fieldName}>Initial Value(s)</label>
          {inputType === 'custom' && inputNode ? (
            inputNode
          ) : (
            <InputTag
              id={fieldName}
              type={inputType}
              value={
                (aiCustomizations[fieldName]?.value as string | number) ||
                (inputType === 'number' ? 0 : '')
              }
              onChange={e => setPropertyValue(fieldName, e.target.value)}
              className={classNames(
                inputType === 'textarea' && moduleStyles.textarea
              )}
              {...(inputType === 'number' && {min, max, step})}
            />
          )}
        </div>
        <VisibilityDropdown
          value={aiCustomizations[fieldName]?.visibility || 'editable'}
          property={fieldName}
        />
      </div>
    </div>
  );
};

export default FieldSection;
