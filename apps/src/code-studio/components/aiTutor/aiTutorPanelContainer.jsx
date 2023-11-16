import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

export default class AITutorPanelContainer extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    level: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    }),
  };

  state = {open: tryGetLocalStorage('ai-tutor-panel', 'open') !== 'closed'};

  hide = () => {
    const {level} = this.props;
    this.setState({open: false});
    trySetLocalStorage('ai-tutor-panel', 'closed');
    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_PANEL_CLOSED, {
      levelId: level.id,
      levelType: level.type,
    });
  };

  show = () => {
    const {level} = this.props;
    this.setState({open: true});
    trySetLocalStorage('ai-tutor-panel', 'open');
    analyticsReporter.sendEvent(EVENTS.AI_TUTOR_PANEL_OPENED, {
      levelId: level.id,
      levelType: level.type,
    });
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
