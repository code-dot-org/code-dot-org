import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ProjectUpdatedAt from './ProjectUpdatedAt';
import headerVignetteStyles from './HeaderVignette';
import $ from 'jquery';

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
  }
};

class ScriptName extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    smallText: PropTypes.bool,
    showProjectUpdatedAt: PropTypes.bool,
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
    isRtl: PropTypes.bool
  };

  getFullWidth() {
    const component = $(this.refs.scriptName);
    return component.length > 0 ? component.width() : 0;
  }

  setDesiredWidth() {
    // Report back to our parent how wide we would like to be.
    if (this.props.setDesiredWidth) {
      this.props.setDesiredWidth(this.getFullWidth());
    }
  }

  componentDidMount() {
    this.setDesiredWidth();
  }

  componentDidUpdate() {
    this.setDesiredWidth();
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
    const fullWidth = this.getFullWidth();
    const actualWidth = this.props.width;

    const vignetteStyle =
      actualWidth < fullWidth
        ? this.props.isRtl
          ? headerVignetteStyles.left
          : headerVignetteStyles.right
        : null;

    if (!this.props.showProjectUpdatedAt) {
      return (
        <div style={{...styles.headerContainer, height: 18}}>
          <div
            className="script_name"
            ref="scriptName"
            style={styles.headerInner}
          >
            {this.renderScriptLink()}
          </div>
          <div className="vignette" style={vignetteStyle} />
        </div>
      );
    }

    return (
      <div style={styles.headerContainer}>
        <div
          className="script_name"
          ref="scriptName"
          style={{...styles.headerInner, height: 40}}
        >
          <div style={styles.outerContainer}>
            <div style={styles.containerWithUpdatedAt}>
              {this.renderScriptLink()}
              <ProjectUpdatedAt />
            </div>
          </div>
        </div>
        <div className="vignette" style={vignetteStyle} />
      </div>
    );
  }
}

export default connect(state => ({
  showProjectUpdatedAt: state.header.showProjectUpdatedAt
}))(ScriptName);
