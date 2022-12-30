import PropTypes from 'prop-types';
import React, {Component} from 'react';
//import PopUpMenu from '../../lib/ui/PopUpMenu';
//import FontAwesome from './../FontAwesome';
// import color from '@cdo/apps/util/color';
import {sectionForDropdownShape} from './teacherDashboard/shapes';

// All this was borrowed from TeacherSectionSelector
export default class TeacherSectionOption extends Component {
  static propTypes = {
    section: sectionForDropdownShape,
    onClick: PropTypes.func.isRequired
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
    return <span>{section.name}</span>;
  }
}

// const styles = {
//   item: {
//     height: 28,
//     lineHeight: '28px',
//     width: 270,
//     fontSize: 14,
//     fontFamily: '"Gotham 4r", sans-serif',
//     whiteSpace: 'nowrap',
//     overflow: 'hidden',
//     textOverflow: 'ellipsis',
//     paddingLeft: 10
//   }
// };
