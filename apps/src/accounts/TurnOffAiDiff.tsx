import Toggle from '@code-dot-org/component-library/toggle';
import {
  BodyTwoText,
  Heading5,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {setAiDifferentiationEnabled} from '@cdo/apps/templates/currentUserRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import moduleStyles from './accountSettings.module.scss';

const TurnOffAiDiff: React.FC = () => {
  const aiDifferentiationEnabled = useAppSelector(
    state => state.currentUser.aiDifferentiationEnabled
  );

  const currentUserId = useAppSelector(state => state.currentUser.userId);

  const handleToggle = () => {
    analyticsReporter.sendEvent(EVENTS.AI_DIFF_CHAT_TOGGLED, {
      'user id': currentUserId,
      state: aiDifferentiationEnabled ? 'off' : 'on',
    });
    new UserPreferences().setAiDifferentiationEnabled(
      !aiDifferentiationEnabled
    );
    dispatch(setAiDifferentiationEnabled(!aiDifferentiationEnabled));
  };

  const dispatch = useAppDispatch();

  const setEnabled = aiDifferentiationEnabled
    ? i18n.enabled()
    : i18n.disabled();

  return (
    <div>
      <hr />
      <Heading5 className={moduleStyles.sectionHeader}>
        {i18n.aiTeachingAssistantSettings()}
      </Heading5>
      <BodyTwoText>
        <SafeMarkdown
          unwrapped
          markdown={i18n.aiTeachingAssistantSettingsDescription()}
        />
      </BodyTwoText>
      <Toggle
        checked={aiDifferentiationEnabled}
        onChange={handleToggle}
        name="aiTeacherDiffToggle"
        position={'left'}
        label={i18n.aiTeachingAssistantSettingsStatus({
          status: setEnabled,
        })}
        size={'m'}
      />
    </div>
  );
};

export default TurnOffAiDiff;
