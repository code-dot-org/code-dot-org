import PropTypes from 'prop-types';
import React, {Component} from 'react';
import PopUpMenu from '../../lib/ui/PopUpMenu';
import FontAwesome from './../FontAwesome';
import color from '../../util/color';
import {sectionForDropdownShape} from './shapes';

const styles = {
  item: {
    height: 28,
    lineHeight: '28px',
    width: 220,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif'
  },
  assigned: {
    marginLeft: 20,
    color: color.level_perfect
  }
};

export default class TeacherSectionSelectorMenuItem extends Component {
  static propTypes = {
    section: sectionForDropdownShape,
    onClick: PropTypes.func.isRequired
  };

  render() {
    const {section, onClick} = this.props;
    return (
      <PopUpMenu.Item onClick={onClick}>
        <div style={styles.item}>
          <span>{section.name}</span>
          <span style={styles.assigned}>
            {section.isAssigned && <FontAwesome icon="check" />}
          </span>
        </div>
      </PopUpMenu.Item>
    );
  }
}
