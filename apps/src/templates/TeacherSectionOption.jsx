import PropTypes from 'prop-types';
import React, {Component} from 'react';
//import PopUpMenu from '../../lib/ui/PopUpMenu';
//import FontAwesome from './../FontAwesome';
import color from '@cdo/apps/util/color';
import {sectionForDropdownShape} from './teacherDashboard/shapes';

// All this was borrowed from TeacherSectionSelector
export default class TeacherSectionOption extends Component {
  static propTypes = {
    section: sectionForDropdownShape,
    // onClick: PropTypes.func.isRequired,
    checked: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      isChecked: this.props.section.isAssigned
    };
  }

  boxChecked = () => {
    this.setState(state => {
      state.isChecked = !state.isChecked;
      return state;
    });
  };

  renderCheckbox = () => {
    const {section} = this.props;
    console.log(section);
    console.log(
      `${section.name}  ${
        section.isAssigned ? ' is assigned' : ' is NOT assigned'
      }`
    );
    // const defaultValue = section.isAssigned;
    console.log(this.state);
    return (
      <input
        type="checkbox"
        checked={this.state.isChecked}
        onChange={this.boxChecked}
        style={styles.checkbox}
      />
    );
  };

  render() {
    const {section} = this.props;
    // const {section, onClick} = this.props;
    // const checkMarkStyle = {
    //   marginRight: 5,
    //   color: color.level_perfect,
    //   visibility: section.isAssigned ? 'visible' : 'hidden'
    // };

    // go to TeacherSectionSelectorMenuItem to see what they return
    // I made this more simple
    return (
      <div>
        <span>{this.renderCheckbox()}</span>
        {section.name}
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
  }
};
