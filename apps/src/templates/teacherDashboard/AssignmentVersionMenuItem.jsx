import React, { Component, PropTypes } from 'react';
import PopUpMenu from "../../lib/ui/PopUpMenu";
import {assignmentVersionShape} from './shapes';

export default class AssignmentSelector extends Component {
  static propTypes = {
    version: assignmentVersionShape,
    onClick: PropTypes.func.isRequired,
  };

  handleClick = () => {
    this.props.onClick();
  };

  render() {
    const {version} = this.props;
    return (
      <PopUpMenu.Item
        onClick={this.handleClick}
      >
        {version.isRecommended ? `${version.title} (Recommended)` : version.title}
      </PopUpMenu.Item>
    );
  }
}
