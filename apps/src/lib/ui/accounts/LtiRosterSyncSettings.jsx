import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Toggle from '@cdo/apps/componentLibrary/toggle';
import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {LmsLinks} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

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
    const eventPayload = {
      lms_name: props.lmsName,
    };
    const eventName = enabled
      ? 'lti_opt_out_toggle_on'
      : 'lti_opt_out_toggle_off';
    analyticsReporter.sendEvent(eventName, eventPayload, PLATFORMS.STATSIG);

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
      <div style={styles.buttonContainer}>
        <button
          type={'button'}
          className={'btn'}
          onClick={handleSubmit}
          tabIndex={'0'}
          disabled={!changed}
        >
          {i18n.ltiSectionSyncSettingsButtonText()}
        </button>
      </div>
    </div>
  );
}

const styles = {
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
};

LtiRosterSyncSettings.propTypes = {
  ltiRosterSyncEnabled: PropTypes.bool.isRequired,
  formId: PropTypes.string.isRequired,
  lmsName: PropTypes.string,
};
