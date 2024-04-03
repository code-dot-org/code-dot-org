import React from 'react';
import moduleStyles from './model-card-row.module.scss';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';

interface ModelCardRowProps {
  keyName: string;
  title: string;
  titleIcon: string;
  expandedContent: string;
}

const ModelCardRow: React.FunctionComponent<ModelCardRowProps> = ({
  keyName,
  title,
  titleIcon,
  expandedContent,
}) => {
  return (
    <>
      <div key={keyName} className={moduleStyles.modelCardAttributes}>
        <CollapsibleSection
          title={title}
          titleSemanticTag="h6"
          titleVisualAppearance="heading-xs"
          titleIcon={titleIcon}
          collapsedIcon="caret-right"
          expandedIcon="caret-down"
        >
          <BodyThreeText className={moduleStyles.expandedContent}>
            {expandedContent}
          </BodyThreeText>
        </CollapsibleSection>
      </div>
      <hr className={moduleStyles.borderLine} />
    </>
  );
};
export default ModelCardRow;
