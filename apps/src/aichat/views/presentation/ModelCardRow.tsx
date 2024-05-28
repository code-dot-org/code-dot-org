import React, {useMemo} from 'react';

import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import moduleStyles from './model-card-row.module.scss';

interface ModelCardRowProps {
  title: string;
  titleIcon: string;
  expandedContent: string | string[];
}

const ModelCardRow: React.FunctionComponent<ModelCardRowProps> = ({
  title,
  titleIcon,
  expandedContent,
}) => {
  const expandedContentToDisplay = useMemo(() => {
    if (Array.isArray(expandedContent)) {
      // Remove empty strings from the array.
      const checkedExpandedContent = expandedContent.filter(
        content => content.length !== 0
      );
      if (checkedExpandedContent.length === 0) {
        return <p>Not available</p>;
      }
      return (
        <ul>
          {checkedExpandedContent.map((content, index) => (
            <li key={index}>{content}</li>
          ))}
        </ul>
      );
    }
    return expandedContent;
  }, [expandedContent]);

  return (
    <>
      <div className={moduleStyles.modelCardAttributes}>
        <CollapsibleSection
          title={title}
          titleSemanticTag="h6"
          titleVisualAppearance="heading-xs"
          titleIcon={titleIcon}
          collapsedIcon="caret-right"
          expandedIcon="caret-down"
        >
          <BodyThreeText className={moduleStyles.expandedContent}>
            <div>{expandedContentToDisplay}</div>
          </BodyThreeText>
        </CollapsibleSection>
      </div>
      <hr className={moduleStyles.borderLine} />
    </>
  );
};
export default ModelCardRow;
