import React from 'react';

import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import FieldSection, {FieldSectionProps} from './FieldSection';

import moduleStyles from './edit-aichat-settings.module.scss';

const CollapsibleFieldSection: React.FunctionComponent<
  {labelText: string} & FieldSectionProps
> = ({labelText, ...rest}) => {
  return (
    <div className={moduleStyles.collapsibleFieldSection}>
      <hr />
      <CollapsibleSection headerContent={labelText}>
        <FieldSection {...rest} />
      </CollapsibleSection>
    </div>
  );
};

export default CollapsibleFieldSection;
