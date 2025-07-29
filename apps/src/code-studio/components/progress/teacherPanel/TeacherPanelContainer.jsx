import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

export default class TeacherPanelContainer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
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
      <div
        className={classNames('teacher-panel', this.props.className, {
          hidden: !this.state.open,
        })}
      >
        {this.props.children}
      </div>
    );
  }
}
