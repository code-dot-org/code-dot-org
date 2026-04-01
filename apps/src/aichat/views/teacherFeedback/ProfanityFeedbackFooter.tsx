import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Typography, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {memo} from 'react';

import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatTeacherFeedback as TeacherFeedback} from '@cdo/generated-scripts/sharedConstants';

import aichatI18n from '../../locale';
import {submitTeacherFeedback} from '../../redux';
import {FeedbackValue} from '../../types';

import moduleStyles from './teacher-feedback-footer.module.scss';

interface Props {
  id: number;
  teacherFeedback?: FeedbackValue;
  toggleProfaneMessageVisibility: () => void;
  profaneMessageVisible: boolean;
}

/**
 * Teacher feedback footer displayed on user messages with profanity violations.
 */
const ProfanityFeedbackFooter: React.FC<Props> = ({
  id,
  teacherFeedback,
  toggleProfaneMessageVisibility,
  profaneMessageVisible,
}) => {
  const dispatch = useAppDispatch();

  const thumbsUpSelected = teacherFeedback === TeacherFeedback.PROFANITY_AGREE;
  const thumbsDownSelected =
    teacherFeedback === TeacherFeedback.PROFANITY_DISAGREE;

  const handleThumbClick = (type: 'up' | 'down') => {
    let feedback: FeedbackValue | undefined;
    // If the user clicks the same thumb again, we should clear the feedback.
    if (type === 'up') {
      feedback = thumbsUpSelected ? undefined : TeacherFeedback.PROFANITY_AGREE;
    } else {
      feedback = thumbsDownSelected
        ? undefined
        : TeacherFeedback.PROFANITY_DISAGREE;
    }

    dispatch(submitTeacherFeedback({id, feedback}));
  };

  const text =
    teacherFeedback === undefined
      ? aichatI18n.chatMessage_wasContentFlaggedCorrectly()
      : thumbsUpSelected
      ? aichatI18n.chatMessage_contentWasFlaggedCorrectly()
      : aichatI18n.chatMessage_contentWasNotFlaggedCorrectly();

  const ThumbButton = (props: {type: 'up' | 'down'; selected: boolean}) => {
    const {type, selected} = props;
    return (
      <MuiIconButton
        variant="text"
        color="secondary"
        size="extraSmall"
        className={classNames(
          moduleStyles[
            `icon-button-${type === 'up' ? 'affirmative' : 'negative'}`
          ],
          selected && moduleStyles.selected
        )}
        onClick={() => handleThumbClick(type)}
        aria-label={
          type === 'up'
            ? aichatI18n.aria_thumbsUp()
            : aichatI18n.aria_thumbsDown()
        }
        type="button"
      >
        <FontAwesomeV6Icon
          iconName={`thumbs-${type}`}
          iconStyle={selected ? 'solid' : 'regular'}
        />
      </MuiIconButton>
    );
  };

  return (
    <div
      className={classNames(
        moduleStyles.teacherFeedbackContainer,
        'uitest-profane-feedback-footer'
      )}
    >
      {profaneMessageVisible && (
        <>
          <Typography className={moduleStyles.flaggedText} variant="em">
            {text}
          </Typography>
          <ThumbButton type="up" selected={thumbsUpSelected} />
          <ThumbButton type="down" selected={thumbsDownSelected} />
        </>
      )}
      <WithTooltip
        key={`show-hide-tooltip-${profaneMessageVisible}`}
        tooltipProps={{
          tooltipId: 'show-hide-tooltip',
          direction: 'onLeft',
          size: 'xs',
          text: profaneMessageVisible
            ? aichatI18n.chatMessage_hideMessage()
            : aichatI18n.chatMessage_showMessage(),
          className: moduleStyles.tooltip,
        }}
      >
        <MuiIconButton
          variant="text"
          color="secondary"
          size="extraSmall"
          className={classNames(
            moduleStyles[`icon-button-gray`],
            profaneMessageVisible && moduleStyles.selected
          )}
          onClick={toggleProfaneMessageVisibility}
          aria-label={
            profaneMessageVisible
              ? aichatI18n.aria_hideMessage()
              : aichatI18n.aria_showMessage()
          }
          type="button"
        >
          <FontAwesomeV6Icon
            iconName={profaneMessageVisible ? 'eye-slash' : 'eye'}
            iconStyle={profaneMessageVisible ? 'solid' : 'regular'}
          />
        </MuiIconButton>
      </WithTooltip>
    </div>
  );
};

export default memo(ProfanityFeedbackFooter);
