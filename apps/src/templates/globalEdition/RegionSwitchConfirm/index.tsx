import Link from '@code-dot-org/component-library/link';
import {Typography, Button as MuiButton} from '@mui/material';
import React, {useCallback, useState, useEffect} from 'react';
import {Fade} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import './style.scss';

interface RegionSwitchConfirmProps {
  code: string; // Region code
  name: string; // Region name
}

const LOCAL_STORAGE_KEY = 'prompted_ge_region';

const RegionSwitchConfirm: React.FC<RegionSwitchConfirmProps> = ({
  code,
  name,
}) => {
  const [show, setShow] = useState(false);

  const reportEvent = useCallback(
    (eventName: string) => {
      analyticsReporter.sendEvent(eventName, {region: code});
    },
    [code]
  );

  useEffect(() => {
    setShow(code !== tryGetLocalStorage(LOCAL_STORAGE_KEY, ''));
  }, [code]);

  useEffect(() => {
    if (show) {
      trySetLocalStorage(LOCAL_STORAGE_KEY, code);
      reportEvent(EVENTS.GLOBAL_EDITION_REGION_SWITCH_CONFIRM_SHOWN);
    }
  }, [show, code, reportEvent]);

  const handleAccept = () => {
    setShow(false);
    reportEvent(EVENTS.GLOBAL_EDITION_REGION_SWITCH_CONFIRM_ACCEPTED);
  };

  const handleReject = () => {
    setShow(false);
    reportEvent(EVENTS.GLOBAL_EDITION_REGION_SWITCH_CONFIRM_REJECTED);
  };

  const handleClose = () => {
    setShow(false);
    reportEvent(EVENTS.GLOBAL_EDITION_REGION_SWITCH_CONFIRM_CLOSED);
  };

  return (
    <Fade in={show} mountOnEnter unmountOnExit>
      <AccessibleDialog
        noMC
        id="global-edition-region-switch-confirm"
        onDismiss={handleClose}
        onClose={() => {}}
      >
        <Typography variant="h1" gutterBottom>
          {i18n.globalEdition_regionSwitchConfirm_title()}
        </Typography>

        <SafeMarkdown
          markdown={i18n.globalEdition_regionSwitchConfirm_text({region: name})}
        />

        <form action={window.location.href} method="post">
          <input type="hidden" name="ge_region" value={code} />
          <MuiButton
            variant="contained"
            color="primary"
            size="large"
            className="no-mc"
            id="global-edition-region-switch-confirm-accept"
            onClick={handleAccept}
            type="submit"
          >
            {i18n.globalEdition_regionSwitchConfirm_accept({region: name})}
          </MuiButton>
        </form>

        <Link
          id="global-edition-region-switch-confirm-reject"
          text={i18n.globalEdition_regionSwitchConfirm_reject()}
          type="secondary"
          size="l"
          onClick={handleReject}
        />
      </AccessibleDialog>
    </Fade>
  );
};

export default RegionSwitchConfirm;
