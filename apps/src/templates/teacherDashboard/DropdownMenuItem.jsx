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
    width: 270,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: 10
  }
};

export default class DropdownMenuItem extends Component {
  static propTypes = {
    option: PropTypes.object.isRequired, // TODO define shape
    isSelected: PropTypes.bool,
    onClick: PropTypes.func.isRequired
  };

  render() {
    const {option, onClick} = this.props;
    const checkMarkStyle = {
      marginRight: 5,
      color: color.level_perfect,
      visibility: this.props.isSelected? 'visible' : 'hidden'
    };

    return (
      <PopUpMenu.Item onClick={onClick} style={styles.item}>
        <span style={checkMarkStyle}>
          <FontAwesome icon="check" />
        </span>
        <span>{option.name}</span>
      </PopUpMenu.Item>
    );
  }
}

