import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProjectUpdatedAt from './ProjectUpdatedAt';

const styles = {
  scriptLinkWithUpdatedAt: {
    display: 'block'
  },
  outerContainer: {
    textAlign: 'right'
  },
  containerWithUpdatedAt: {
    verticalAlign: 'bottom',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block'
  }
};

class ScriptName extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    smallText: PropTypes.bool,
    showProjectUpdatedAt: PropTypes.bool,
    width: PropTypes.number
  };

  renderScriptLink() {
    let className = 'header_text';
    if (this.props.smallText) {
      className += ' small_font_on_tablet';
    }
    return (
      <a
        href={this.props.href}
        className={className}
        style={
          this.props.showProjectUpdatedAt
            ? {...styles.scriptLinkWithUpdatedAt}
            : {}
        }
        title={this.props.name}
      >
        {this.props.name}
      </a>
    );
  }

  render() {
    if (!this.props.showProjectUpdatedAt) {
      return this.renderScriptLink();
    }

    return (
      <div style={styles.outerContainer}>
        <div
          style={{...styles.containerWithUpdatedAt, maxWidth: this.props.width}}
        >
          {this.renderScriptLink()}
          <ProjectUpdatedAt />
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  showProjectUpdatedAt: state.header.showProjectUpdatedAt
}))(ScriptName);
