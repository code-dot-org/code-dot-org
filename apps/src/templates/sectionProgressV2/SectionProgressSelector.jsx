import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {DCDO} from '@cdo/apps/dcdo';
import SectionProgress from '../sectionProgress/SectionProgress';
import Button from '@cdo/apps/applab/designElements/button';
import {setShowProgressTableV2} from '@cdo/apps/templates/currentUserRedux';

function SectionProgressV2({showProgressTableV2, setShowProgressTableV2}) {
  const toggleV1OrV2Button = React.useCallback(
    () => (
      <div>
        <Button onClick={() => setShowProgressTableV2(!showProgressTableV2)}>
          Toggle
        </Button>
      </div>
    ),

    [showProgressTableV2, setShowProgressTableV2]
  );

  // If progress table is disabled, only show the v1 table.
  if (!DCDO.get('progress-table-v2-enabled', false)) {
    console.log('progress-table-v2-enabled is false');
    return <SectionProgress />;
  }
  console.log('progress-table-v2-enabled is true');

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

SectionProgressV2.propTypes = {
  showProgressTableV2: PropTypes.bool,
  setShowProgressTableV2: PropTypes.func.isRequired,
};

export default connect(
  state => ({showProgressTableV2: state.currentUser.showProgressTableV2}),
  dispatch => ({
    setShowProgressTableV2: showProgressTableV2 =>
      dispatch(setShowProgressTableV2(showProgressTableV2)),
  })
)(SectionProgressV2);
