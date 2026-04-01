import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {memo} from 'react';

import CopyButton from '@cdo/apps/aiComponentLibrary/copyButton/CopyButton';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatTeacherFeedback as TeacherFeedback} from '@cdo/generated-scripts/sharedConstants';

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

  const copyButton = (
    <CopyButton
      key="copy"
      copyText={chatMessageText}
      usage={'teacher-feedback-footer'}
    />
  );
  const flagButton = (
    <WithTooltip
      key={`flag-tooltip-${teacherFlagged}`}
      tooltipProps={{
        tooltipId: 'flag-tooltip',
        direction: isAssistant ? 'onRight' : 'onLeft',
        size: 'xs',
        text: teacherFlagged
          ? 'Flagged as inappropriate'
          : 'Flag message as inappropriate',
        className: moduleStyles.tooltip,
        iconLeft: teacherFlagged ? {iconName: 'check'} : undefined,
      }}
    >
      <MuiIconButton
        variant="text"
        color="secondary"
        size="extraSmall"
        className={classNames(
          moduleStyles[`icon-button-negative`],
          teacherFlagged && moduleStyles.selected
        )}
        onClick={handleFlagClick}
        aria-label={teacherFlagged ? 'unflag' : 'flag'}
        type="button"
      >
        <FontAwesomeV6Icon
          iconName="flag-pennant"
          iconStyle={teacherFlagged ? 'solid' : 'regular'}
        />
      </MuiIconButton>
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
