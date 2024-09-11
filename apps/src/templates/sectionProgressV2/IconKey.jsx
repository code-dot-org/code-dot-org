import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Link from '@cdo/apps/componentLibrary/link';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import AssignmentCompletionStatesBox from './AssignmentCompletionStatesBox';
import LevelTypesBox from './LevelTypesBox';
import MoreDetailsDialog from './MoreDetailsDialog.jsx';
import TeacherActionsBox from './TeacherActionsBox';

import styles from './progress-table-legend.module.scss';

export default function IconKey({sectionId}) {
  const [isOpen, setIsOpen] = useState(
    tryGetLocalStorage('iconKeyIsOpen', 'true') !== 'false'
  );
  const [isIconDetailsOpen, setIconDetailsOpen] = useState(false);

  const openMoreDetailsDialog = event => {
    event.preventDefault();
    setIconDetailsOpen(true);

    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_VIEW_MORE_DETAILS, {
      sectionId: sectionId,
    });
  };

  const caret = isOpenA => (isOpenA ? 'caret-down' : 'caret-right');

  const sectionContent = () => (
    <>
      <AssignmentCompletionStatesBox />
      <TeacherActionsBox />
      <LevelTypesBox />
    </>
  );

  const clickListener = () => {
    trySetLocalStorage('iconKeyIsOpen', !isOpen);
    setIsOpen(!isOpen);

    if (!isOpen) {
      analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_EXPAND_ICON_KEY, {
        sectionId: sectionId,
      });
    } else {
      analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_COLLAPSE_ICON_KEY, {
        sectionId: sectionId,
      });
    }
  };

  return (
    <div
      className={styles.iconKey}
      aria-expanded={isOpen}
      aria-label={i18n.iconKey()}
    >
      <div className={styles.iconKeyHeader}>
        <div
          onClick={clickListener}
          className={styles.iconKeyTitle}
          data-testid="expandable-container"
          role="button"
          aria-expanded={isOpen}
          tabIndex="0"
        >
          <Heading6>
            <FontAwesome className={styles.iconKeyCaret} icon={caret(isOpen)} />
            {i18n.iconKey()}
          </Heading6>
        </div>
        <Link
          type="primary"
          size="s"
          onClick={openMoreDetailsDialog}
          className={styles.iconKeyMoreDetailsLink}
        >
          {i18n.moreDetails()}
        </Link>
      </div>
      {isOpen && sectionContent()}
      {isIconDetailsOpen && (
        <MoreDetailsDialog onClose={() => setIconDetailsOpen(false)} />
      )}
    </div>
  );
}

IconKey.propTypes = {
  sectionId: PropTypes.number,
};
