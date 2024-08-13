import React, {useMemo} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {BodyThreeText, Heading6} from '@cdo/apps/componentLibrary/typography';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import InfoTooltipIcon from '../InfoTooltipIcon';

import moduleStyles from './model-card-row.module.scss';

interface ModelCardRowProps {
  title: string;
  titleIcon?: string;
  expandedContent: string | string[];
  tooltipText: string;
}

const ModelCardRow: React.FunctionComponent<ModelCardRowProps> = ({
  title,
  titleIcon,
  expandedContent,
  tooltipText,
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
          collapsedIcon="caret-right"
          expandedIcon="caret-down"
          headerContent={
            <div className={moduleStyles.sectionHeader}>
              {titleIcon && (
                <FontAwesomeV6Icon
                  iconName={titleIcon}
                  className={moduleStyles.titleIcon}
                />
              )}
              <Heading6
                visualAppearance="heading-xs"
                className={moduleStyles.sectionTitle}
              >
                {title}
              </Heading6>
              <InfoTooltipIcon
                id={title}
                tooltipText={tooltipText}
                direction="onRight"
              />
            </div>
          }
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
