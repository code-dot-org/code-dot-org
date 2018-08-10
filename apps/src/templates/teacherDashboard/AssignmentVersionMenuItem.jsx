import React, { Component, PropTypes } from 'react';
import PopUpMenu from "../../lib/ui/PopUpMenu";
import {assignmentVersionShape} from './shapes';
import i18n from '@cdo/locale';

export default class AssignmentVersionMenuItem extends Component {
  static propTypes = {
    version: assignmentVersionShape,
    onClick: PropTypes.func.isRequired,
  };

  render() {
    const {version, onClick} = this.props;
    return (
      <PopUpMenu.Item onClick={onClick}>
        {version.isRecommended ? `${version.title} (${i18n.recommended()})` : version.title}
      </PopUpMenu.Item>
    );
  }
}
