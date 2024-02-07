import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

function UnitSelectorV2({setScriptId, scriptId, loadUnitProgress}) {
  const onChangeScript = scriptId => {
    this.props.setScriptId(scriptId);
    loadUnitProgress(scriptId, this.props.sectionId);

    this.recordEvent('change_script', {
      old_script_id: this.props.scriptId,
      new_script_id: scriptId,
    });

    analyticsReporter.sendEvent(EVENTS.PROGRESS_CHANGE_UNIT, {
      sectionId: this.props.sectionId,
      oldUnitId: this.props.scriptId,
      unitId: scriptId,
    });
  };
}

UnitSelectorV2.propTypes = {
  scriptId: PropTypes.number,
  setScriptId: PropTypes.func.isRequired,
  coursesWithProgress: PropTypes.array.isRequired,
};

export default connect(
  state => ({
    scriptId: state.unitSelection.scriptId,
    coursesWithProgress: state.unitSelection.coursesWithProgress,
  }),
  dispatch => ({
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    },
  })
)(UnitSelectorV2);
