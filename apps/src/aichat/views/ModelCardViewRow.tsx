import React from 'react';
import moduleStyles from '@cdo/apps/aichat/views/model-card-view-row.module.scss';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';
import {BodyFourText} from '@cdo/apps/componentLibrary/typography';

interface ModelCardViewRowProps {
  keyName: string;
  title: string;
  titleIcon: string;
  expandedContent: string;
}

const ModelCardViewRow: React.FunctionComponent<ModelCardViewRowProps> = ({
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
          <BodyFourText className={moduleStyles.expandedContent}>
            <i>{expandedContent}</i>
          </BodyFourText>
        </CollapsibleSection>
      </div>
      <hr className={moduleStyles.borderLine} />
    </>
  );
};
export default ModelCardViewRow;
