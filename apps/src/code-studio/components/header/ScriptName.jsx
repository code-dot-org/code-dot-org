import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProjectUpdatedAt from './ProjectUpdatedAt';

const styles = {
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    height: 40
  },
  headerInner: {
    position: 'absolute'
  },
  scriptLinkWithUpdatedAt: {
    display: 'block'
  },
  outerContainer: {
    textAlign: 'right'
  },
  containerWithUpdatedAt: {
    verticalAlign: 'bottom',
    display: 'inline-block'
  },
  headerVignetteRight: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background:
      'linear-gradient(to right, rgba(0, 173, 188, 0) calc(100% - 20px), rgba(0, 173, 188, 1) 100%)'
  }
};

class ScriptName extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    smallText: PropTypes.bool,
    showProjectUpdatedAt: PropTypes.bool,
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func
  };

  componentDidMount() {
    // Report back to our parent how wide we would like to be.
    const fullWidth = $('.script_name').width();
    if (this.props.setDesiredWidth) {
      this.props.setDesiredWidth(fullWidth);
    }
  }

  componentDidUpdate() {
    // Report back to our parent how wide we would like to be.
    const fullWidth = $('.script_name').width();
    this.props.setDesiredWidth(fullWidth);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.width !== nextProps.width ||
      this.props.name !== nextProps.name ||
      this.props.showProjectUpdatedAt !== nextProps.showProjectUpdatedAt
    );
  }

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
    const fullWidth = $('.script_name').width();
    const actualWidth = this.props.width;

    const vignetteStyle =
      actualWidth < fullWidth ? styles.headerVignetteRight : null;

    console.log('ScriptName render', this.props.width);

    if (!this.props.showProjectUpdatedAt) {
      return (
        <div style={{...styles.headerContainer, height: 18}}>
          <div className="script_name" style={styles.headerInner}>
            {this.renderScriptLink()}
          </div>
          <div id="vignette" style={vignetteStyle} />
        </div>
      );
    }

    return (
      <div style={styles.headerContainer}>
        <div
          className="script_name"
          style={{...styles.headerInner, height: 40}}
        >
          <div style={styles.outerContainer}>
            <div style={styles.containerWithUpdatedAt}>
              {this.renderScriptLink()}
              <ProjectUpdatedAt />
            </div>
          </div>
        </div>
        <div id="vignette" style={vignetteStyle} />
      </div>
    );
  }
}

export default connect(state => ({
  showProjectUpdatedAt: state.header.showProjectUpdatedAt
}))(ScriptName);
