import classNames from 'classnames';
import React, {useState} from 'react';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import {EmText} from '@cdo/apps/componentLibrary/typography';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatTeacherFeedback as TeacherFeedback} from '@cdo/generated-scripts/sharedConstants';

import aichatI18n from '../locale';
import {submitTeacherFeedback} from '../redux/aichatRedux';
import {FeedbackValue} from '../types';

import moduleStyles from './teacher-feedback-footer.module.scss';

interface Props {
  isProfanityViolation: boolean;
  id: number;
  teacherFeedback?: FeedbackValue;
  role: Role;
}

const TeacherFeedbackFooter: React.FC<Props> = props => {
  const Footer = props.isProfanityViolation ? ProfanityFooter : CleanFooter;
  return <Footer {...props} />;
};

const CleanFooter: React.FC<Props> = ({id, teacherFeedback, role}) => {
  const dispatch = useAppDispatch();
  const handleFlagClick = () => {
    const toggled = !flaggedAsInappropriate;
    setFlaggedAsInappropriate(toggled);
    dispatch(
      submitTeacherFeedback({
        id,
        feedback: toggled ? TeacherFeedback.CLEAN_DISAGREE : undefined,
      })
    );
  };

  const [flaggedAsInappropriate, setFlaggedAsInappropriate] = useState(
    teacherFeedback === TeacherFeedback.CLEAN_DISAGREE
  );

  return (
    <div
      className={classNames(
        moduleStyles.teacherFeedbackContainer,
        role === Role.ASSISTANT && moduleStyles.assistantFeedback
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
        icon={{iconName: 'flag-pennant', iconStyle: 'solid'}}
        isIconOnly={true}
        onClick={handleFlagClick}
        size="xs"
        type={flaggedAsInappropriate ? 'primary' : 'tertiary'}
        className={classNames(
          moduleStyles['button-xxs'],
          !flaggedAsInappropriate && moduleStyles.flagButtonColorOverride
        )}
        ariaLabel={flaggedAsInappropriate ? 'unflag' : 'flag'}
      />
    </div>
  );
};

const ProfanityFooter: React.FC<Props> = ({id, teacherFeedback}) => {
  const dispatch = useAppDispatch();
  const [currentFeedback, setCurrentFeedback] = useState(teacherFeedback);

  const handleThumbClick = (type: 'up' | 'down') => {
    let feedback: FeedbackValue | undefined;
    // If the user clicks the same thumb again, we should clear the feedback.
    if (type === 'up') {
      feedback =
        currentFeedback === TeacherFeedback.PROFANITY_AGREE
          ? undefined
          : TeacherFeedback.PROFANITY_AGREE;
    } else {
      feedback =
        currentFeedback === TeacherFeedback.PROFANITY_DISAGREE
          ? undefined
          : TeacherFeedback.PROFANITY_DISAGREE;
    }

    setCurrentFeedback(feedback);
    dispatch(submitTeacherFeedback({id, feedback}));
  };

  return (
    <div className={moduleStyles.teacherFeedbackContainer}>
      <EmText>{aichatI18n.chatMessage_wasContentFlaggedCorrectly()}</EmText>
      <Button
        color={buttonColors.black}
        icon={{iconName: 'thumbs-up', iconStyle: 'solid'}}
        isIconOnly={true}
        onClick={() => handleThumbClick('up')}
        size="xs"
        type={
          currentFeedback === TeacherFeedback.PROFANITY_AGREE
            ? 'primary'
            : 'tertiary'
        }
        ariaLabel="thumbs up"
      />
      <Button
        color={buttonColors.black}
        icon={{iconName: 'thumbs-down', iconStyle: 'solid'}}
        isIconOnly={true}
        onClick={() => handleThumbClick('down')}
        size="xs"
        type={
          currentFeedback === TeacherFeedback.PROFANITY_DISAGREE
            ? 'primary'
            : 'tertiary'
        }
        ariaLabel="thumbs down"
      />
    </div>
  );
};

export default TeacherFeedbackFooter;
