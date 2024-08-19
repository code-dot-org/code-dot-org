import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

export default class TeacherPanelContainer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    logToFirehose: PropTypes.func,
  };

  state = {open: tryGetLocalStorage('teacher-panel', 'open') !== 'closed'};

  logToFirehose = () => {
    if (this.props.logToFirehose) {
      const eventName = this.state.open ? 'open' : 'close';
      this.props.logToFirehose(eventName);
    }
  };

  hide = () => {
    this.setState({open: false}, this.logToFirehose);
    trySetLocalStorage('teacher-panel', 'closed');
  };

  show = () => {
    this.setState({open: true}, this.logToFirehose);
    trySetLocalStorage('teacher-panel', 'open');
  };

  render() {
    return (
      <div className={classNames('teacher-panel', {hidden: !this.state.open})}>
        <div className="hide-handle">
          <FontAwesome icon="chevron-right" onClick={this.hide} />
        </div>
        <div className="show-handle">
          <FontAwesome icon="chevron-left" onClick={this.show} />
        </div>
        {this.props.children}
      </div>
    );
  }
}
