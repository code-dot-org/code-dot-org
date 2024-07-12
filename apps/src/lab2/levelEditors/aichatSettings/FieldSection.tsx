import {AiCustomizations} from '@cdo/apps/aichat/types';
import React, {useContext} from 'react';
import {BodyFourText} from '@cdo/apps/componentLibrary/typography';
import classNames from 'classnames';
import moduleStyles from './edit-aichat-settings.module.scss';
import VisibilityDropdown from './VisibilityDropdown';
import {UpdateContext} from './UpdateContext';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

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
  const {aichatSettings, setPropertyValue} = useContext(UpdateContext);
  const InputTag = inputType === 'textarea' ? 'textarea' : 'input';
  const {initialCustomizations, visibilities} = aichatSettings;
  return (
    <div className={moduleStyles.fieldSection}>
      <hr />
      <CollapsibleSection headerContent={labelText}>
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
      </CollapsibleSection>
    </div>
  );
};

export default FieldSection;
