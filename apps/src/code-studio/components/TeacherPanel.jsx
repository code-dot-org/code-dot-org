import React from 'react';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const TeacherPanel = React.createClass({
  propTypes: {
    children: React.PropTypes.node
  },

  getInitialState() {
    return {
      open: true
    };
  },

  hide() {
    this.setState({open: false});
  },

  show() {
    this.setState({open: true});
  },

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
});

export default TeacherPanel;
