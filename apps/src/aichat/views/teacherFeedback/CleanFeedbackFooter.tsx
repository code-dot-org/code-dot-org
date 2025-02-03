import {Button, buttonColors} from '@code-dot-org/component-library/button';
import classNames from 'classnames';
import React, {memo} from 'react';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
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
  role: Role;
}

/**
 * Teacher feedback footer displayed for messages without any profanity violations or errors.
 */
const CleanFeedbackFooter: React.FC<Props> = ({id, teacherFeedback, role}) => {
  const teacherFlagged = teacherFeedback === TeacherFeedback.CLEAN_DISAGREE;
  const dispatch = useAppDispatch();
  const handleFlagClick = () => {
    dispatch(
      submitTeacherFeedback({
        id,
        feedback: teacherFlagged ? undefined : TeacherFeedback.CLEAN_DISAGREE,
      })
    );
  };

  return (
    <div
      className={classNames(
        moduleStyles.teacherFeedbackContainer,
        role === Role.ASSISTANT && moduleStyles.assistantFeedback
      )}
    >
      {teacherFlagged && (
        <EmText>{aichatI18n.chatMessage_hasBeenFlagged()}</EmText>
      )}
      <WithTooltip
        key={`flag-tooltip-${teacherFlagged}`}
        tooltipProps={{
          tooltipId: 'flag-tooltip',
          direction: role === Role.ASSISTANT ? 'onRight' : 'onLeft',
          size: 'xs',
          text: teacherFlagged
            ? aichatI18n.chatMessage_unflagAsInappropriate()
            : aichatI18n.chatMessage_flagAsInappropriate(),
          className: moduleStyles.tooltip,
        }}
      >
        <Button
          color={buttonColors.black}
          icon={{
            iconName: 'flag-pennant',
            iconStyle: teacherFlagged ? 'solid' : 'regular',
          }}
          isIconOnly={true}
          onClick={handleFlagClick}
          size="xs"
          type={'tertiary'}
          className={classNames(
            moduleStyles[`icon-button-negative`],
            teacherFlagged && moduleStyles.selected
          )}
          ariaLabel={
            teacherFlagged ? aichatI18n.aria_flag() : aichatI18n.aria_unflag()
          }
        />
      </WithTooltip>
    </div>
  );
};

export default memo(CleanFeedbackFooter);
