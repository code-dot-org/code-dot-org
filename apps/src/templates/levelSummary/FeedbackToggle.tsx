import Button from '@code-dot-org/component-library/button';
import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
import React, {useState} from 'react';

import i18n from '@cdo/locale';

import style from './feedback-toggle.module.scss';

interface FeedbackToggleProps {
  color?: 'gray' | 'white' | 'black' | 'multi';
  size?: ComponentSizeXSToL;
  onThumbsUpClick: () => void;
  onThumbsDownClick: () => void;
}

const FeedbackToggle: React.FC<FeedbackToggleProps> = ({
  onThumbsUpClick,
  onThumbsDownClick,
  size = 'm',
  color = 'gray',
}) => {
  const [thumbsUp, setThumbsUp] = useState(false);
  const [thumbsDown, setThumbsDown] = useState(false);

  const handleThumbsUpClick = () => {
    onThumbsUpClick();
    setThumbsUp(!thumbsUp);
    setThumbsDown(false);
  };

  const handleThumbsDownClick = () => {
    onThumbsDownClick();
    setThumbsDown(!thumbsDown);
    setThumbsUp(false);
  };

  const getIconStyle = (isSelected: boolean, iconName: string) => {
    let iconClassname;
    if (isSelected && color === 'multi') {
      if (iconName === 'thumbs-up') {
        iconClassname = style.thumbsUpSelected;
      } else {
        iconClassname = style.thumbsDownSelected;
      }
    } else {
      if (color === 'black') {
        iconClassname = style.blackIcon;
      } else if (color === 'white') {
        iconClassname = style.whiteIcon;
      } else {
        iconClassname = style.grayIcon;
      }
    }
    return iconClassname;
  };

  return (
    <div className={style.container}>
      <Button
        aria-label={i18n.aiResponseThumbsUp()}
        onClick={handleThumbsUpClick}
        color="white"
        size={size}
        isIconOnly
        icon={{
          iconStyle: thumbsUp ? 'solid' : 'regular',
          iconName: 'thumbs-up',
        }}
        type="primary"
        className={getIconStyle(thumbsUp, 'thumbs-up')}
      />
      <Button
        aria-label={i18n.aiResponseThumbsDown()}
        onClick={handleThumbsDownClick}
        color="white"
        size={size}
        isIconOnly
        icon={{
          iconStyle: thumbsDown ? 'solid' : 'regular',
          iconName: 'thumbs-down',
        }}
        type="primary"
        className={getIconStyle(thumbsDown, 'thumbs-down')}
      />
    </div>
  );
};

export default FeedbackToggle;
