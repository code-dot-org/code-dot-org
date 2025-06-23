import {Button, buttonColors} from '@code-dot-org/component-library/button';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import classNames from 'classnames';
import React, {memo} from 'react';

import CopyButton from '@cdo/apps/aiComponentLibrary/copyButton/CopyButton';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatTeacherFeedback as TeacherFeedback} from '@cdo/generated-scripts/sharedConstants';

import aichatI18n from '../../locale';
import {submitTeacherFeedback} from '../../redux';
import {FeedbackValue} from '../../types';

import moduleStyles from './teacher-feedback-footer.module.scss';

interface Props {
  id: number;
  chatMessageText: string;
  isAssistant: boolean;
  teacherFeedback?: FeedbackValue;
}

/**
 * Teacher feedback footer displayed for messages without any profanity violations or errors.
 */
const CleanFeedbackFooter: React.FC<Props> = ({
  id,
  chatMessageText,
  isAssistant,
  teacherFeedback,
}) => {
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

  const copyButton = <CopyButton copyText={chatMessageText} />;
  const flagButton = (
    <WithTooltip
      key={`flag-tooltip-${teacherFlagged}`}
      tooltipProps={{
        tooltipId: 'flag-tooltip',
        direction: isAssistant ? 'onRight' : 'onLeft',
        size: 'xs',
        text: teacherFlagged
          ? aichatI18n.chatMessage_flaggedAsInappropriate()
          : aichatI18n.chatMessage_flagAsInappropriate(),
        className: moduleStyles.tooltip,
        iconLeft: teacherFlagged ? {iconName: 'check'} : undefined,
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
          teacherFlagged ? aichatI18n.aria_unflag() : aichatI18n.aria_flag()
        }
      />
    </WithTooltip>
  );

  // Place elements in the correct semantic order.
  const footerElements = isAssistant ? [copyButton, flagButton] : [flagButton];

  return (
    <div
      className={classNames(
        moduleStyles.teacherFeedbackContainer,
        isAssistant && moduleStyles.leftAlign,
        'uitest-clean-feedback-footer'
      )}
    >
      {footerElements}
    </div>
  );
};

export default memo(CleanFeedbackFooter);
