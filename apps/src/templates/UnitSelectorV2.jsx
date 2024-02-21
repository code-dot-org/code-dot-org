import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import SimpleDropdown from '../componentLibrary/simpleDropdown/SimpleDropdown';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';

function UnitSelectorV2({
  sectionId,
  scriptId,
  coursesWithProgress,
  className,
  setScriptId,
}) {
  const onSelectUnit = React.useCallback(
    e => {
      const newScriptId = e.target.value;
      setScriptId(newScriptId);
      loadUnitProgress(newScriptId, sectionId);

      this.recordEvent('change_script_v2', {
        old_script_id: scriptId,
        new_script_id: newScriptId,
      });

      analyticsReporter.sendEvent(EVENTS.PROGRESS_CHANGE_UNIT, {
        sectionId: sectionId,
        oldUnitId: scriptId,
        unitId: newScriptId,
      });
    },
    [scriptId, setScriptId, sectionId]
  );

  const itemGroups = coursesWithProgress.map(version => ({
    label: version.display_name,
    groupItems: version.units.map(unit => ({
      value: unit.id,
      text: unit.name,
    })),
  }));

  return (
    <SimpleDropdown
      itemGroups={itemGroups}
      selectedValue={scriptId}
      name="unitSelector"
      onChange={onSelectUnit}
      className={className}
      isLabelVisible={false}
      size="s"
    />
  );
}

UnitSelectorV2.propTypes = {
  scriptId: PropTypes.number,
  sectionId: PropTypes.number,
  coursesWithProgress: PropTypes.array.isRequired,
  setScriptId: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default connect(
  state => ({
    scriptId: state.unitSelection.scriptId,
    sectionId: state.teacherSections.selectedSectionId,
    coursesWithProgress: state.unitSelection.coursesWithProgress,
  }),
  dispatch => ({
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    },
  })
)(UnitSelectorV2);
