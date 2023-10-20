import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

export default class AIToolsPanelContainer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  state = {open: tryGetLocalStorage('ai-tools-panel', 'open') !== 'closed'};

  hide = () => {
    this.setState({open: false});
    trySetLocalStorage('ai-tools-panel', 'closed');
  };

  show = () => {
    this.setState({open: true});
    trySetLocalStorage('ai-tools-panel', 'open');
  };

  render() {
    return (
      
        <div className={classNames('ai-tools-panel', {hidden: !this.state.open})}>
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