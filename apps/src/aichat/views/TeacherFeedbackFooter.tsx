import classNames from 'classnames';
import React, {useState} from 'react';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {EmText} from '@cdo/apps/componentLibrary/typography';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatTeacherFeedback as TeacherFeedback} from '@cdo/generated-scripts/sharedConstants';

import aichatI18n from '../locale';
import {submitTeacherFeedback} from '../redux/aichatRedux';
import {ChatMessage} from '../types';

import moduleStyles from './teacher-feedback-footer.module.scss';

interface Props {
  isProfanityViolation: boolean;
  chatMessage: ChatMessage;
}

const TeacherFeedbackFooter: React.FC<Props> = ({
  isProfanityViolation,
  chatMessage,
}) => {
  const dispatch = useAppDispatch();
  const [thumbsUp, setThumbsUp] = useState(
    chatMessage.teacherFeedback === TeacherFeedback.PROFANITY_AGREE
  );
  const [thumbsDown, setThumbsDown] = useState(
    chatMessage.teacherFeedback === TeacherFeedback.PROFANITY_DISAGREE
  );
  const handleThumbClick = (thumbsUp: boolean, thumbsDown: boolean) => {
    setThumbsUp(thumbsUp);
    setThumbsDown(thumbsDown);
    const teacherFeedback = thumbsUp
      ? TeacherFeedback.PROFANITY_AGREE
      : thumbsDown
      ? TeacherFeedback.PROFANITY_DISAGREE
      : undefined;
    dispatch(submitTeacherFeedback({...chatMessage, teacherFeedback}));
  };

  const [flaggedAsInappropriate, setFlaggedAsInappropriate] = useState(
    chatMessage.teacherFeedback === TeacherFeedback.CLEAN_DISAGREE
  );
  const handleFlagClick = (toggle: boolean) => {
    setFlaggedAsInappropriate(toggle);
    const teacherFeedback = toggle ? TeacherFeedback.CLEAN_DISAGREE : undefined;
    dispatch(submitTeacherFeedback({...chatMessage, teacherFeedback}));
  };

  return (
    <>
      {isProfanityViolation && (
        <div className={moduleStyles.teacherFeedbackContainer}>
          <EmText>{aichatI18n.chatMessage_wasContentFlaggedCorrectly()}</EmText>
          <Button
            color={buttonColors.black}
            disabled={false}
            icon={{iconName: 'thumbs-up', iconStyle: 'solid'}}
            isIconOnly={true}
            onClick={() => handleThumbClick(!thumbsUp, false)}
            size="xs"
            type={thumbsUp ? 'primary' : 'tertiary'}
            ariaLabel="thumbs up"
          />
          <Button
            color={buttonColors.black}
            disabled={false}
            icon={{iconName: 'thumbs-down', iconStyle: 'solid'}}
            isIconOnly={true}
            onClick={() => handleThumbClick(false, !thumbsDown)}
            size="xs"
            type={thumbsDown ? 'primary' : 'tertiary'}
            ariaLabel="thumbs down"
          />
        </div>
      )}
      {!isProfanityViolation && (
        <div
          className={classNames(
            moduleStyles.teacherFeedbackContainer,
            chatMessage.role === Role.ASSISTANT &&
              moduleStyles.assistanctFeedbackContainerOverride
          )}
        >
          <EmText
            className={classNames(
              moduleStyles.hiddenTilHover,
              flaggedAsInappropriate && moduleStyles.showAlways
            )}
          >
            {flaggedAsInappropriate
              ? aichatI18n.chatMessage_hasBeenFlagged()
              : aichatI18n.chatMessage_flagAsInappropriate()}
          </EmText>
          <Button
            color={buttonColors.black}
            disabled={false}
            icon={{iconName: 'flag-pennant', iconStyle: 'solid'}}
            isIconOnly={true}
            onClick={() => handleFlagClick(!flaggedAsInappropriate)}
            size="xs"
            type={flaggedAsInappropriate ? 'primary' : 'tertiary'}
            className={classNames(
              moduleStyles['button-xxs'],
              !flaggedAsInappropriate && moduleStyles.flagButtonColorOverride
            )}
            ariaLabel={flaggedAsInappropriate ? 'unflag' : 'flag'}
          />
        </div>
      )}
    </>
  );
};

export default TeacherFeedbackFooter;
