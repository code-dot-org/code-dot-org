import PropTypes from 'prop-types';
import React, {useState} from 'react';
import i18n from '@cdo/locale';
import Toggle from '@cdo/apps/componentLibrary/toggle';
import {LmsLinks} from '@cdo/apps/util/sharedConstants';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

export default function LtiRosterSyncSettings(props) {
  const enabledLabel = i18n.ltiSectionSyncEnabled();
  const disabledLabel = i18n.ltiSectionSyncDisabled();
  const settingsDescription = i18n.ltiSectionSyncSettingsDescription({
    syncDocsUrl: LmsLinks.ROSTER_SYNC_INSTRUCTIONS_URL,
  });
  const [enabled, setEnabled] = useState(props.ltiRosterSyncEnabled);
  const [label, setLabel] = useState(enabled ? enabledLabel : disabledLabel);
  const [changed, setChanged] = useState(false);

  const handleSubmit = () => {
    const form = document.getElementById(props.formId);
    form.elements['user_lti_roster_sync_enabled'].value = enabled;
    form.submit();
  };

  return (
    <div>
      <hr />
      <h2>{i18n.ltiSectionSyncSettingsTitle()}</h2>
      <SafeMarkdown markdown={settingsDescription} />
      <Toggle
        onChange={() => {
          setEnabled(!enabled);
          setLabel(label === enabledLabel ? disabledLabel : enabledLabel);
          setChanged(true);
        }}
        checked={enabled}
        label={label}
        size={'s'}
        name={'lti_roster_sync_enabled'}
      />
      <button
        type={'button'}
        className={'btn'}
        style={styles.button}
        onClick={handleSubmit}
        tabIndex={'0'}
        disabled={!changed}
      >
        {i18n.ltiSectionSyncSettingsButtonText()}
      </button>
    </div>
  );
}

const styles = {
  button: {
    float: 'right',
  },
};

LtiRosterSyncSettings.propTypes = {
  ltiRosterSyncEnabled: PropTypes.bool.isRequired,
  formId: PropTypes.string.isRequired,
};
