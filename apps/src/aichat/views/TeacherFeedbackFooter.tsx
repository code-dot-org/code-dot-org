import classNames from 'classnames';
import React, {useState} from 'react';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';

import moduleStyles from './teacher-feedback-footer.module.scss';

interface Props {
  isProfanityViolation: boolean;
}

const TeacherFeedbackFooter: React.FC<Props> = ({isProfanityViolation}) => {
  const [thumbsUp, setThumbsUp] = useState(false);
  const [thumbsDown, setThumbsDown] = useState(false);
  const handleThumbClick = (thumbsUp: boolean, thumbsDown: boolean) => {
    setThumbsUp(thumbsUp);
    setThumbsDown(thumbsDown);
  };

  const [flaggedAsInappropriate, setFlaggedAsInappropriate] = useState(false);
  const handleFlagClick = (toggle: boolean) => {
    setFlaggedAsInappropriate(toggle);
  };

  return (
    <div className={moduleStyles.outerContainer}>
      {isProfanityViolation && (
        <div
          className={classNames(
            moduleStyles.flaggyContainer,
            moduleStyles.showAlways
          )}
        >
          <Typography semanticTag="em" visualAppearance="em">
            Was this content flagged correctly?
          </Typography>
          <Button
            color={buttonColors.black}
            disabled={false}
            icon={{iconName: 'thumbs-up', iconStyle: 'solid'}}
            isIconOnly={true}
            onClick={() => handleThumbClick(!thumbsUp, false)}
            size="xs"
            type={thumbsUp ? 'primary' : 'tertiary'}
          />
          <Button
            color={buttonColors.black}
            disabled={false}
            icon={{iconName: 'thumbs-down', iconStyle: 'solid'}}
            isIconOnly={true}
            onClick={() => handleThumbClick(false, !thumbsDown)}
            size="xs"
            type={thumbsDown ? 'primary' : 'tertiary'}
          />
        </div>
      )}
      {!isProfanityViolation && (
        <div
          className={classNames(
            moduleStyles.flaggyContainer,
            flaggedAsInappropriate && moduleStyles.showAlways
          )}
        >
          <Typography semanticTag="em" visualAppearance="em">
            {flaggedAsInappropriate
              ? 'This message has been flagged'
              : 'Flag message as inappropriate'}
          </Typography>
          <Button
            color={buttonColors.black}
            disabled={false}
            icon={{iconName: 'flag-pennant', iconStyle: 'solid'}}
            isIconOnly={true}
            onClick={() => handleFlagClick(!flaggedAsInappropriate)}
            size="xs"
            type={flaggedAsInappropriate ? 'primary' : 'tertiary'}
          />
        </div>
      )}
    </div>
  );
};

export default TeacherFeedbackFooter;
