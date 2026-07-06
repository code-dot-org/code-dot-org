import Toggle from '@code-dot-org/component-library/toggle';
import {Typography as MuiTypography, Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import GlobalEditionWrapper from '@cdo/apps/templates/GlobalEditionWrapper';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {LmsLinks} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import commonStyles from './common/common.styles.module.scss';

export function LtiRosterSyncSettings(props) {
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
    analyticsReporter.sendEvent(eventName, eventPayload);

    const form = document.getElementById(props.formId);
    form.elements['user_lti_roster_sync_enabled'].value = enabled;
    form.submit();
  };

  return (
    <div>
      <hr className={commonStyles.sectionDivider} />
      <MuiTypography variant="h5" component="h2" gutterBottom>
        {i18n.ltiSectionSyncSettingsTitle()}
      </MuiTypography>
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
        <MuiButton
          type="button"
          variant="contained"
          color="primary"
          size="small"
          onClick={handleSubmit}
          disabled={!changed}
        >
          {i18n.ltiSectionSyncSettingsButtonText()}
        </MuiButton>
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

const RegionalLtiRosterSyncSettings = props => (
  <GlobalEditionWrapper
    component={LtiRosterSyncSettings}
    componentId="LtiRosterSyncSettings"
    props={props}
  />
);

export default RegionalLtiRosterSyncSettings;
