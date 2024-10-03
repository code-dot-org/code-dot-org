import React, {useCallback, useState, useEffect} from 'react';
import {Fade} from 'react-bootstrap';

import Button from '@cdo/apps/componentLibrary/button/Button';
import Link from '@cdo/apps/componentLibrary/link/Link';
import {Heading1} from '@cdo/apps/componentLibrary/typography';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import './style.scss';

interface RegionSwitchConfirmProps {
  country: string;
  region: {
    code: string;
    name: string;
    href: string;
  };
}

const LOCAL_STORAGE_KEY = 'prompted_ge_region';

const RegionSwitchConfirm: React.FC<RegionSwitchConfirmProps> = ({
  country,
  region,
}) => {
  const reportEvent = useCallback(
    (eventName: string, payload: object = {}) => {
      analyticsReporter.sendEvent(
        eventName,
        {
          country: country,
          region: region.code,
          ...payload,
        },
        PLATFORMS.STATSIG
      );
    },
    [country, region]
  );

  const [show, setShow] = useState(false);
  const promptedRegion = tryGetLocalStorage(LOCAL_STORAGE_KEY, '');

  useEffect(() => {
    setShow(region.code !== promptedRegion);
  }, [region, promptedRegion]);

  useEffect(() => {
    if (show) {
      trySetLocalStorage(LOCAL_STORAGE_KEY, region.code);
      reportEvent(EVENTS.GLOBAL_EDITION_REGION_SWITCH_CONFIRM_SHOWN);
    }
  }, [show, region, reportEvent]);

  const handleSwitch = () => {
    reportEvent(EVENTS.GLOBAL_EDITION_REGION_SWITCH_CONFIRM_ACCEPTED, {
      page: region.href,
    });
    window.location.href = region.href;
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
        <Heading1>{i18n.globalEdition_regionSwitchConfirm_title()}</Heading1>

        <SafeMarkdown
          markdown={i18n.globalEdition_regionSwitchConfirm_text({
            region: region.name,
          })}
        />

        <Button
          id="global-edition-region-switch-confirm-accept"
          className="no-mc"
          text={i18n.globalEdition_regionSwitchConfirm_switch({
            region: region.name,
          })}
          type="primary"
          size="l"
          onClick={handleSwitch}
        />

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
