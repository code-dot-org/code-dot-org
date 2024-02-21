import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import i18n from '@cdo/locale';
import SimpleDropdown from '../componentLibrary/simpleDropdown/SimpleDropdown';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {loadUnitProgress} from './sectionProgressLoader';
import {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';

const FAMILY_NAME = 'familyName';
const DISPLAY_NAME = 'displayName';

function UnitSelectorV2({
  scriptId,
  coursesWithProgress,
  className,
  setScriptId,
}) {
  const onSelectUnit = useCallback(
    e => {
      setScriptId(scriptId);
      loadUnitProgress(scriptId, this.props.sectionId);

      this.recordEvent('change_script_v2', {
        old_script_id: this.props.scriptId,
        new_script_id: scriptId,
      });

      analyticsReporter.sendEvent(EVENTS.PROGRESS_CHANGE_UNIT, {
        sectionId: this.props.sectionId,
        oldUnitId: this.props.scriptId,
        unitId: scriptId,
      });
    },
    [scriptId, setScriptId]
  );

  const itemGroups = coursesWithProgress.map((version, index) => (
    <optgroup key={index} label={version.display_name}>
      {version.units.map(unit => (
        <option key={unit.id} value={unit.id}>
          {unit.name}
        </option>
      ))}
    </optgroup>
  ));

  return (
    <SimpleDropdown
      itemGroups
      selectedValue={scriptId}
      name="unitSelector"
      onChange={onSelectUnit}
      labelText={i18n.selectACourse()}
      className={className}
      size="s"
    />
  );
}

UnitSelectorV2.propTypes = {
  scriptId: PropTypes.number,
  coursesWithProgress: PropTypes.array.isRequired,
  setScriptId: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default connect(
  state => ({isSortedByFamilyName: state.currentUser.isSortedByFamilyName}),
  dispatch => ({
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    },
  })
)(UnitSelectorV2);
