import React, {PropTypes} from 'react';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

export default class TeacherPanel extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  state = {open: tryGetLocalStorage('teacher-panel', 'open') !== 'closed'};

  hide = () => {
    this.setState({open: false});
    trySetLocalStorage('teacher-panel', 'closed');
  };

  show = () => {
    this.setState({open: true});
    trySetLocalStorage('teacher-panel', 'open');
  };

  render() {
    return (
      <div className={classNames("teacher-panel", { hidden: !this.state.open })}>
        <div className="hide-handle">
          <FontAwesome
            icon="chevron-right"
            onClick={this.hide}
          />
        </div>
        <div className="show-handle">
          <FontAwesome
            icon="chevron-left"
            onClick={this.show}
          />
        </div>
        {this.props.children}
      </div>
    );
  }
}
