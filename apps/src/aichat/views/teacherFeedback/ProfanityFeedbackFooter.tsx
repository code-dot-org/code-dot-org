import {Button, buttonColors} from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {memo} from 'react';

import {WithTooltip} from '@cdo/apps/componentLibrary/tooltip';
import {EmText} from '@cdo/apps/componentLibrary/typography';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatTeacherFeedback as TeacherFeedback} from '@cdo/generated-scripts/sharedConstants';

import aichatI18n from '../../locale';
import {submitTeacherFeedback} from '../../redux/aichatRedux';
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
      <Button
        color={buttonColors.black}
        icon={{
          iconName: `thumbs-${type}`,
          iconStyle: selected ? 'solid' : 'regular',
        }}
        isIconOnly={true}
        onClick={() => handleThumbClick(type)}
        size="xs"
        type={'tertiary'}
        ariaLabel={
          type === 'up'
            ? aichatI18n.aria_thumbsUp()
            : aichatI18n.aria_thumbsDown()
        }
        className={classNames(
          moduleStyles[
            `icon-button-${type === 'up' ? 'affirmative' : 'negative'}`
          ],
          selected && moduleStyles.selected
        )}
      />
    );
  };

  return (
    <div className={moduleStyles.teacherFeedbackContainer}>
      {profaneMessageVisible && (
        <>
          <EmText>{text}</EmText>
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
        <Button
          color={buttonColors.black}
          icon={{
            iconName: profaneMessageVisible ? 'eye-slash' : 'eye',
            iconStyle: profaneMessageVisible ? 'solid' : 'regular',
          }}
          isIconOnly={true}
          onClick={toggleProfaneMessageVisibility}
          size="xs"
          type={'tertiary'}
          ariaLabel={
            profaneMessageVisible
              ? aichatI18n.aria_hideMessage()
              : aichatI18n.aria_showMessage()
          }
          className={classNames(
            moduleStyles[`icon-button-gray`],
            profaneMessageVisible && moduleStyles.selected
          )}
        />
      </WithTooltip>
    </div>
  );
};

export default memo(ProfanityFeedbackFooter);
