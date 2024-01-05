import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import DCDO from '@cdo/apps/dcdo';
import SectionProgress from '../sectionProgress/SectionProgress';
import Button from '@cdo/apps/templates/Button';
import {setShowProgressTableV2} from '@cdo/apps/templates/currentUserRedux';
import SectionProgressV2 from './SectionProgressV2';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';

function SectionProgressSelector({
  showProgressTableV2,
  setShowProgressTableV2,
}) {
  console.log('lfm1');

  const onShowProgressTableV2Change = useCallback(
    e => {
      const shouldShowV2 = !showProgressTableV2;
      new UserPreferences().setSortByFamilyName(shouldShowV2);
      setShowProgressTableV2(shouldShowV2);
    },
    [showProgressTableV2, setShowProgressTableV2]
  );
  const toggleV1OrV2Button = () => (
    <div>
      <Button onClick={onShowProgressTableV2Change}>Toggle V1/V2</Button>
    </div>
  );

  // If progress table is disabled, only show the v1 table.
  if (!DCDO.get('progress-table-v2-enabled', false)) {
    console.log('progress-table-v2-enabled is false');
    return <SectionProgress />;
  }
  console.log('progress-table-v2-enabled is true');

  console.log('lfm2', showProgressTableV2);

  // If the user has not selected manually the v1 or v2 table, show the DCDO defined default.
  if (showProgressTableV2 === undefined) {
    if (!DCDO.get('progress-table-v2-default-v2', false)) {
      return (
        <div>
          {toggleV1OrV2Button()}
          <SectionProgress />
        </div>
      );
    }

    return (
      <div>
        {toggleV1OrV2Button()}
        <SectionProgressV2 />
      </div>
    );
  }

  // If a user has selected manually, show that version.
  if (showProgressTableV2) {
    return (
      <div>
        {toggleV1OrV2Button()}
        <SectionProgressV2 />
      </div>
    );
  }
  return (
    <div>
      {toggleV1OrV2Button()}
      <SectionProgress />
    </div>
  );
}

SectionProgressSelector.propTypes = {
  showProgressTableV2: PropTypes.bool,
  setShowProgressTableV2: PropTypes.func.isRequired,
};

export default connect(
  state => ({showProgressTableV2: state.currentUser.showProgressTableV2}),
  dispatch => ({
    setShowProgressTableV2: showProgressTableV2 =>
      dispatch(setShowProgressTableV2(showProgressTableV2)),
  })
)(SectionProgressSelector);
