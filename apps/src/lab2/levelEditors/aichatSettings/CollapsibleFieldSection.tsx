import React from 'react';

import {AiCustomizations} from '@cdo/apps/aichat/types';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import AiCustomizationFieldSection from './AiCustomizationFieldSection';

import moduleStyles from './edit-aichat-settings.module.scss';

interface CollapsibleFieldSectionProps {
  fieldName: keyof AiCustomizations;
  labelText: string;
  description?: string;
  inputType: 'text' | 'number' | 'textarea' | 'custom';
  inputNode?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}

const CollapsibleFieldSection: React.FunctionComponent<
  CollapsibleFieldSectionProps
> = ({
  fieldName,
  description,
  labelText,
  inputType,
  inputNode,
  min,
  max,
  step,
}) => {
  return (
    <div className={moduleStyles.collapsibleFieldSection}>
      <hr />
      <CollapsibleSection headerContent={labelText}>
        <AiCustomizationFieldSection
          fieldName={fieldName}
          description={description}
          inputType={inputType}
          inputNode={inputNode}
          min={min}
          max={max}
          step={step}
        />
      </CollapsibleSection>
    </div>
  );
};

export default CollapsibleFieldSection;
