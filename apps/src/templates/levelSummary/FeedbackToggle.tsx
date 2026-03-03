import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
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
      <MuiIconButton
        variant="contained"
        color="white"
        size="medium"
        className={getIconStyle(thumbsUp, 'thumbs-up')}
        onClick={handleThumbsUpClick}
        aria-label={i18n.aiResponseThumbsUp()}
        type="button"
      >
        <FontAwesomeV6Icon
          iconStyle={thumbsUp ? 'solid' : 'regular'}
          iconName="thumbs-up"
        />
      </MuiIconButton>
      <MuiIconButton
        variant="contained"
        color="white"
        size="medium"
        className={getIconStyle(thumbsDown, 'thumbs-down')}
        onClick={handleThumbsDownClick}
        aria-label={i18n.aiResponseThumbsDown()}
        type="button"
      >
        <FontAwesomeV6Icon
          iconStyle={thumbsDown ? 'solid' : 'regular'}
          iconName="thumbs-down"
        />
      </MuiIconButton>
    </div>
  );
};

export default FeedbackToggle;
