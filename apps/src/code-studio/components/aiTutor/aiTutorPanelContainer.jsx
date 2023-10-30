import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

export default class AITutorPanelContainer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  state = {open: tryGetLocalStorage('ai-tutor-panel', 'open') !== 'closed'};

  hide = () => {
    this.setState({open: false});
    trySetLocalStorage('ai-tutor-panel', 'closed');
  };

  show = () => {
    this.setState({open: true});
    trySetLocalStorage('ai-tutor-panel', 'open');
  };

  render() {
    return (
      <div className={classNames('ai-tutor-panel', {hidden: !this.state.open})}>
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
