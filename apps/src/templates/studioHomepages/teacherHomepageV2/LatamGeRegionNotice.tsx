// TODO(GEPW-34): Remove the component after July 30, 2026

import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React, {FC, useState, useEffect} from 'react';

import DCDO from '@cdo/apps/dcdo';
import {useLocalization} from '@cdo/apps/localization';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import styles from './teacherHomepage.module.scss';

const TARGET_LOCALE = 'es-MX';
const NOTICE_STATE_KEY = 'LatamGeRegionNotice';
const NOTICE_CLOSED_STATE = 'closed';

export const LatamGeRegionNotice: FC = () => {
  const locale = useLocalization();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(
      locale === TARGET_LOCALE &&
        tryGetLocalStorage(NOTICE_STATE_KEY, '') !== NOTICE_CLOSED_STATE &&
        new Date(
          String(DCDO.get('latam-ge-region-notice-enabled-until') || 0)
        ) > new Date()
    );
  }, [locale]);

  if (!isVisible) return <></>;

  return (
    <Alert
      className={styles.notificationBanner}
      type={alertTypes.info}
      isImmediateImportance={false}
      text="Selecciona español de EE. UU. si estás en EE. UU. o español latinoamericano si estás en Latinoamérica para una experiencia adaptada a tu región."
      link={{
        text: '¡Cámbiate a Español-LATAM!',
        href: (() => {
          const url = new URL(window.location.href);
          url.searchParams.set('ge_region', 'la');
          return url.toString();
        })(),
        onClick: () =>
          analyticsReporter.sendEvent(EVENTS.LATAM_GE_REGION_NOTICE_CLICKED),
      }}
      onClose={() => {
        setIsVisible(false);
        trySetLocalStorage(NOTICE_STATE_KEY, NOTICE_CLOSED_STATE);
        analyticsReporter.sendEvent(EVENTS.LATAM_GE_REGION_NOTICE_CLOSED);
      }}
    />
  );
};

export default LatamGeRegionNotice;
