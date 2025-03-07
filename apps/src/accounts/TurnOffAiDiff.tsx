import Toggle from '@code-dot-org/component-library/toggle';
import {
  BodyTwoText,
  Heading5,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {setAiDifferentiationToggledOff} from '@cdo/apps/templates/currentUserRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import moduleStyles from './accountSettings.module.scss';

const TurnOffAiDiff: React.FC = () => {
  const toggledOff = useAppSelector(
    state => state.currentUser.aiDifferentiationToggledOff
  );

  const currentUserId = useAppSelector(state => state.currentUser.userId);

  const handleToggle = () => {
    analyticsReporter.sendEvent(EVENTS.AI_DIFF_CHAT_TOGGLED, {
      'user id': currentUserId,
      state: !toggledOff ? 'on' : 'off',
    });
    new UserPreferences().setAiDifferentiationToggledOff(!toggledOff);
    dispatch(setAiDifferentiationToggledOff(!toggledOff));
  };

  const dispatch = useAppDispatch();

  const setEnabled = toggledOff ? i18n.disabled() : i18n.enabled();

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
        checked={!toggledOff}
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
