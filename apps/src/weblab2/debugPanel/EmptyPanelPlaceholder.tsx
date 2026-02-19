import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import moduleStyles from './empty-panel-placeholder.module.scss';

interface EmptyPanelPlaceholderProps {
  iconName: string;
  title: string;
  description: string;
}

const EmptyPanelPlaceholder: React.FunctionComponent<
  EmptyPanelPlaceholderProps
> = ({iconName, title, description}) => {
  return (
    <div className={moduleStyles.container}>
      <div className={moduleStyles.innerContainer}>
        <div className={moduleStyles.iconCircle}>
          <FontAwesomeV6Icon iconName={iconName} />
        </div>
        <BodyTwoText className={moduleStyles.title}>
          <StrongText>{title}</StrongText>
        </BodyTwoText>
        <BodyFourText className={moduleStyles.description}>
          {description}
        </BodyFourText>
      </div>
    </div>
  );
};

export default EmptyPanelPlaceholder;
