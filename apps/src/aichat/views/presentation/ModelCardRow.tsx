import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {useMemo} from 'react';

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
          headerContent={
            <div className={moduleStyles.sectionHeader}>
              {titleIcon && (
                <FontAwesomeV6Icon
                  iconName={titleIcon}
                  className={moduleStyles.titleIcon}
                />
              )}
              <Typography
                className={moduleStyles.sectionTitle}
                variant="h6"
                gutterBottom
              >
                {title}
              </Typography>
              <InfoTooltipIcon
                id={title}
                tooltipText={tooltipText}
                direction="onRight"
              />
            </div>
          }
        >
          <Typography
            className={moduleStyles.expandedContent}
            variant="body3"
            gutterBottom
          >
            <div>{expandedContentToDisplay}</div>
          </Typography>
        </CollapsibleSection>
      </div>
      <hr className={moduleStyles.borderLine} />
    </>
  );
};
export default ModelCardRow;
