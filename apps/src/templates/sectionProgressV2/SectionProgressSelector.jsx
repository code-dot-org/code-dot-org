import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {connect} from 'react-redux';

import Link from '@cdo/apps/componentLibrary/link';
import DCDO from '@cdo/apps/dcdo';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {setShowProgressTableV2} from '@cdo/apps/templates/currentUserRedux';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';

import SectionProgress from '../sectionProgress/SectionProgress';

import InviteToV2ProgressModal from './InviteToV2ProgressModal';
import ProgressBanners from './ProgressBanners';
import SectionProgressV2 from './SectionProgressV2';

import styles from './progress-header.module.scss';

function SectionProgressSelector({
  showProgressTableV2,
  setShowProgressTableV2,
  progressTableV2ClosedBeta,
  sectionId,
}) {
  const [toggleUsed, setToggleUsed] = React.useState(false);

  const onShowProgressTableV2Change = useCallback(
    e => {
      e.preventDefault();
      const shouldShowV2 = !showProgressTableV2;
      new UserPreferences().setShowProgressTableV2(shouldShowV2);
      setShowProgressTableV2(shouldShowV2);
      setToggleUsed(true);

      if (shouldShowV2) {
        analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_VIEW_NEW_PROGRESS, {
          sectionId: sectionId,
        });
      } else {
        analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_VIEW_OLD_PROGRESS, {
          sectionId: sectionId,
        });
      }
    },
    [showProgressTableV2, setShowProgressTableV2, sectionId]
  );

  const debouncedOnShowProgressTableV2Change = _.debounce(
    onShowProgressTableV2Change,
    300,
    {
      leading: true,
      trailing: false,
    }
  );

  // If progress table is disabled, only show the v1 table.
  // If closed beta is disabled or the user is not in the closed beta, only show the v1 table.
  const isInClosedBeta =
    DCDO.get('progress-table-v2-closed-beta-enabled', false) &&
    progressTableV2ClosedBeta;
  const allowSelection =
    experiments.isEnabled(experiments.SECTION_PROGRESS_V2) ||
    DCDO.get('progress-table-v2-enabled', false) ||
    isInClosedBeta;
  if (!allowSelection) {
    return <SectionProgress />;
  }

  // If the user has not selected manually the v1 or v2 table, show the DCDO defined default.
  // If a user has selected manually, show that version.
  const isPreferenceSet = showProgressTableV2 !== undefined;
  const displayV2 = isPreferenceSet
    ? showProgressTableV2
    : DCDO.get('progress-table-v2-default-v2', false);

  const toggleV1OrV2Link = () => (
    <div className={styles.toggleViews}>
      <Link
        type="primary"
        size="s"
        onClick={debouncedOnShowProgressTableV2Change}
        id="ui-test-toggle-progress-view"
      >
        {displayV2
          ? i18n.switchToOldProgressView()
          : i18n.switchToNewProgressView()}
      </Link>
    </div>
  );

  return (
    <div className={styles.pageContent}>
      {displayV2 && <ProgressBanners toggleUsed={toggleUsed} />}
      {toggleV1OrV2Link()}

      {displayV2 ? (
        <SectionProgressV2 />
      ) : (
        <>
          <InviteToV2ProgressModal sectionId={sectionId} />
          <SectionProgress allowUserToSelectV2View={true} />
        </>
      )}
    </div>
  );
}

SectionProgressSelector.propTypes = {
  showProgressTableV2: PropTypes.bool,
  progressTableV2ClosedBeta: PropTypes.bool,
  setShowProgressTableV2: PropTypes.func.isRequired,
  sectionId: PropTypes.number,
};

export const UnconnectedSectionProgressSelector = SectionProgressSelector;

export default connect(
  state => ({
    showProgressTableV2: state.currentUser.showProgressTableV2,
    progressTableV2ClosedBeta: state.currentUser.progressTableV2ClosedBeta,
    sectionId: state.teacherSections.selectedSectionId,
  }),
  dispatch => ({
    setShowProgressTableV2: showProgressTableV2 =>
      dispatch(setShowProgressTableV2(showProgressTableV2)),
  })
)(SectionProgressSelector);
