import React from 'react';

import Toggle from '@cdo/apps/componentLibrary/toggle/Toggle';
import {BodyTwoText, Heading5} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import moduleStyles from './accountSettings.module.scss';

const TurnOffAiDiff: React.FC = () => {
  const [hasAIDiffAccess, setHasAIDiffAccess] = React.useState(true);

  const handleToggle = () => {
    console.log('Toggling AI Teaching Assistant');
    setHasAIDiffAccess(!hasAIDiffAccess);
  };

  const setEnabled = hasAIDiffAccess ? i18n.enabled() : i18n.disabled();

  return (
    <div>
      <Heading5 className={moduleStyles.sectionHeader}>
        {i18n.aiTeachingAssistantSettings()}
      </Heading5>
      <BodyTwoText>{i18n.aiTeachingAssistantSettingsDescription()}</BodyTwoText>
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
