import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import moduleStyles from './backpack-message.module.scss';

interface BackpackMessageProps {
  type: 'neutral' | 'error';
  iconName: string;
  iconAnimation?: FontAwesomeV6IconProps['animationType'];
  title: string;
  message: string;
  BottomComponent?: React.ReactNode;
}

const BackpackMessage: React.FC<BackpackMessageProps> = ({
  type,
  iconName,
  iconAnimation,
  title,
  message,
  BottomComponent,
}) => {
  return (
    <div className={moduleStyles.backpackPanelWithMessage}>
      <div
        className={
          type === 'error'
            ? moduleStyles.errorIconContainer
            : moduleStyles.neutralIconContainer
        }
      >
        <FontAwesomeV6Icon
          iconName={iconName}
          iconStyle="solid"
          className={moduleStyles.icon}
          animationType={iconAnimation}
        />
      </div>
      <div className={moduleStyles.backpackMessageText}>
        <BodyTwoText>
          <StrongText>{title}</StrongText>
        </BodyTwoText>
        <BodyFourText>{message}</BodyFourText>
      </div>
      {BottomComponent}
    </div>
  );
};

export default BackpackMessage;
