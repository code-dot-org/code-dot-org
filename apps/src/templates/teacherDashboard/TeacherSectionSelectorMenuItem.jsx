import PropTypes from 'prop-types';
import React, {Component} from 'react';

import fontConstants from '@cdo/apps/fontConstants';

import FontAwesome from '../../legacySharedComponents/FontAwesome';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import color from '../../util/color';

import {sectionForDropdownShape} from './shapes';

export default class TeacherSectionSelectorMenuItem extends Component {
  static propTypes = {
    section: sectionForDropdownShape,
    onClick: PropTypes.func.isRequired,
  };

  render() {
    const {section, onClick} = this.props;
    const checkMarkStyle = {
      marginRight: 5,
      color: color.level_perfect,
      visibility: section.isAssigned ? 'visible' : 'hidden',
    };

    return (
      <PopUpMenu.Item onClick={onClick} style={styles.item}>
        <span style={checkMarkStyle}>
          <FontAwesome icon="check" />
        </span>
        <span>{section.name}</span>
      </PopUpMenu.Item>
    );
  }
}

const styles = {
  item: {
    height: 28,
    lineHeight: '28px',
    width: 270,
    fontSize: 14,
    ...fontConstants['main-font-regular'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: 10,
  },
};
