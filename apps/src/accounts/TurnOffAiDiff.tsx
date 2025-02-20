import Toggle from '@code-dot-org/component-library/toggle';
import {
  BodyTwoText,
  Heading5,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {setAiDifferentiationEnabled} from '@cdo/apps/templates/currentUserRedux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import moduleStyles from './accountSettings.module.scss';

const TurnOffAiDiff: React.FC = () => {
  const reduxState = useAppSelector(
    state => state.currentUser.aiDifferentiationEnabled
  );

  const startingState = () => {
    if (reduxState === null) {
      new UserPreferences().setAiDifferentiationEnabled(true);
      return true;
    } else {
      return reduxState;
    }
  };

  const [hasAIDiffAccess, setHasAIDiffAccess] = React.useState(startingState);

  const handleToggle = () => {
    dispatch(setAiDifferentiationEnabled(!hasAIDiffAccess));
    new UserPreferences().setAiDifferentiationEnabled(!hasAIDiffAccess);
    setHasAIDiffAccess(!hasAIDiffAccess);
  };

  const dispatch = useAppDispatch();

  const setEnabled = hasAIDiffAccess ? i18n.enabled() : i18n.disabled();

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
        checked={hasAIDiffAccess}
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
