import React from 'react';

import Link from '@cdo/apps/componentLibrary/link';
import Typography from '@cdo/apps/componentLibrary/typography/Typography';
import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import {LmsInformationalCardProps} from './types';

import styles from './lmsInformationalCard.module.scss';

const LmsInformationalCard = ({
  lmsName,
  lmsInformationalUrl,
  lmsLogo,
}: LmsInformationalCardProps) => {
  const publishClickEvent = () => {
    analyticsReporter.sendEvent(
      'section_create_lms_tile_click',
      {lms_name: lmsName},
      PLATFORMS.STATSIG
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardText}>
        <Typography
          semanticTag="h4"
          visualAppearance="heading-md"
          className={styles.title}
        >
          {lmsName}
        </Typography>
        <Link
          text={i18n.addStudentsToSectionViewSetupGuide()}
          href={lmsInformationalUrl}
          onClick={publishClickEvent}
          size={'xs'}
          openInNewTab={true}
          className={styles.lmsInstructionsLink}
        />
      </div>
      <img src={lmsLogo} alt={lmsName} className={styles.logo} />
    </div>
  );
};

export default LmsInformationalCard;
