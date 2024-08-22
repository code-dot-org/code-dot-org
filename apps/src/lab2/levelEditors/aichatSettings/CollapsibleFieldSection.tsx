import React from 'react';

import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import FieldSection, {FieldSectionProps} from './FieldSection';

import moduleStyles from './edit-aichat-settings.module.scss';

const CollapsibleFieldSection: React.FunctionComponent<
  FieldSectionProps & {labelText: string}
> = ({
  labelText,
  fieldName,
  description,
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
        <FieldSection
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
