import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {asyncLoadCoursesWithProgress} from '@cdo/apps/redux/unitSelectionRedux';

export const dropdownStyles = {
  dropdown: {
    display: 'block',
    boxSizing: 'border-box',
    fontSize: 'medium',
    height: 34,
    paddingLeft: 5,
    paddingRight: 5,
    width: 300,
  },
};

class UnitSelector extends Component {
  static propTypes = {
    coursesWithProgress: PropTypes.array.isRequired,
    scriptId: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    asyncLoadCoursesWithProgress: PropTypes.func.isRequired,
    isLoadingCourses: PropTypes.bool,
  };

  componentDidMount() {
    this.props.asyncLoadCoursesWithProgress();
  }

  render() {
    const {scriptId, onChange, coursesWithProgress} = this.props;

    if (this.props.isLoadingCourses) {
      <div>
        <select
          disabled={true}
          value={'loading'}
          style={dropdownStyles.dropdown}
          id="uitest-course-dropdown"
        >
          <option key="loading" value="loading">
            Loading...
          </option>
        </select>
      </div>;
    }

    return (
      <div>
        <select
          value={scriptId || undefined}
          onChange={event => onChange(parseInt(event.target.value))}
          style={dropdownStyles.dropdown}
          id="uitest-course-dropdown"
        >
          {coursesWithProgress.map((version, index) => (
            <optgroup key={index} label={version.display_name}>
              {version.units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    );
  }
}

export const UnconnectedUnitSelector = UnitSelector;

export default connect(
  state => ({
    coursesWithProgress: state.unitSelection.coursesWithProgress,
    isLoadingCourses: state.unitSelection.isLoadingCoursesWithProgress,
  }),
  dispatch => ({
    asyncLoadCoursesWithProgress() {
      dispatch(asyncLoadCoursesWithProgress());
    },
  })
)(UnitSelector);
