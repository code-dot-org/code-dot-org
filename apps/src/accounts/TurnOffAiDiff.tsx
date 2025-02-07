/* eslint-disable react/no-danger */
import React from 'react';

import Toggle from '@cdo/apps/componentLibrary/toggle/Toggle';
import {BodyTwoText, Heading5} from '@cdo/apps/componentLibrary/typography';
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
    console.log('Toggling AI Teaching Assistant');
    console.log('familyNameTest:', familyNameTest);
    dispatch(setAiDifferentiationEnabled(!hasAIDiffAccess));
    new UserPreferences().setAiDifferentiationEnabled(!hasAIDiffAccess);
    setHasAIDiffAccess(!hasAIDiffAccess);
  };

  const dispatch = useAppDispatch();

  const familyNameTest = useAppSelector(
    state => state.currentUser.isSortedByFamilyName
  );

  const setEnabled = hasAIDiffAccess ? i18n.enabled() : i18n.disabled();

  return (
    <div>
      <hr />
      <Heading5 className={moduleStyles.sectionHeader}>
        {i18n.aiTeachingAssistantSettings()}
      </Heading5>
      <BodyTwoText>{i18n.aiTeachingAssistantSettingsDescription()}</BodyTwoText>
      <Toggle
        checked={hasAIDiffAccess}
        onChange={handleToggle}
        name="aiTeacherDiffToggle"
        position={'left'}
        label={
          <SafeMarkdown
            markdown={i18n.aiTeachingAssistantSettingsStatus({
              status: setEnabled,
            })}
          />
        }
        size={'m'}
      />
    </div>
  );
};

export default TurnOffAiDiff;
