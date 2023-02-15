import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import {sectionForDropdownShape} from './teacherDashboard/shapes';

export default class TeacherSectionOption extends Component {
  static propTypes = {
    section: sectionForDropdownShape,
    onChange: PropTypes.func.isRequired,
    isChecked: PropTypes.bool,
    assignedSections: PropTypes.arrayOf(sectionForDropdownShape)
  };

  constructor(props) {
    super(props);

    this.state = {
      updatedAssignedSections: this.props.assignedSections
    };
  }

  renderCheckbox = () => {
    const {isChecked, onChange} = this.props;
    return (
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        style={styles.checkbox}
      />
    );
  };

  render() {
    const {section} = this.props;
    return (
      <div>
        <span>
          <div style={styles.sectionOptionContainer}>
            <div>{this.renderCheckbox()}</div>
            <label style={styles.sectionOptionLabel}>{section.name}</label>
          </div>
        </span>
      </div>
    );
  }
}

const styles = {
  item: {
    height: 28,
    lineHeight: '28px',
    width: 270,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: 10
  },
  checkboxIcon: {
    color: color.lighter_gray
  },
  checkbox: {
    height: 20,
    width: 20
  },
  sectionOptionContainer: {
    display: 'flex',
    alignItems: 'baseline'
  },
  sectionOptionLabel: {
    padding: '7px'
  }
};
