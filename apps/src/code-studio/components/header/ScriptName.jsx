import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import measureRenderedWidth from './measureRenderedWidth';
import ProjectUpdatedAt from './ProjectUpdatedAt';
import remeasureOnFontsReady from './remeasureOnFontsReady';

class ScriptName extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    smallText: PropTypes.bool,
    showProjectUpdatedAt: PropTypes.bool,
    width: PropTypes.number,
    setDesiredWidth: PropTypes.func,
    isRtl: PropTypes.bool,
  };

  getFullWidth() {
    return measureRenderedWidth(this.refs.scriptName);
  }

  setDesiredWidth() {
    // Skip when truncated: the <a> has width: actualWidth applied, so
    // getFullWidth() would return actualWidth instead of the natural text
    // width, permanently locking the parent's desired-width to the capped value.
    if (!this.props.setDesiredWidth || this._isTruncated) return;
    this.props.setDesiredWidth(this.getFullWidth());
  }

  componentDidMount() {
    this.setDesiredWidth();
    this.cancelFontRemeasure = remeasureOnFontsReady(() =>
      this.setDesiredWidth()
    );
  }

  componentWillUnmount() {
    this.cancelFontRemeasure?.();
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

  onProjectUpdatedAtContentUpdated = () => {
    this.setDesiredWidth();
  };

  renderScriptLink(linkStyle) {
    let className = 'header_text';
    if (this.props.smallText) {
      className += ' small_font_on_tablet';
    }
    return (
      <a
        href={this.props.href}
        className={className}
        style={linkStyle}
        title={this.props.name}
      >
        {this.props.name}
      </a>
    );
  }

  render() {
    const fullWidth = this.getFullWidth();
    const actualWidth = this.props.width;
    const isTruncated = actualWidth > 0 && fullWidth > actualWidth;
    this._isTruncated = isTruncated;
    const {isRtl} = this.props;

    const ellipsisStyle = isTruncated
      ? {
          display: 'block',
          width: actualWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...(isRtl ? {direction: 'rtl'} : {}),
        }
      : {};

    if (!this.props.showProjectUpdatedAt) {
      return (
        <div style={{...styles.headerContainer, height: 18}}>
          <div
            className="script_name"
            ref="scriptName"
            style={styles.headerInner}
          >
            {this.renderScriptLink(ellipsisStyle)}
          </div>
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
              {this.renderScriptLink({
                ...styles.scriptLinkWithUpdatedAt,
                ...ellipsisStyle,
                ...(isTruncated
                  ? {alignSelf: isRtl ? 'flex-end' : 'flex-start'}
                  : {}),
              })}
              <ProjectUpdatedAt
                onContentUpdated={this.onProjectUpdatedAtContentUpdated}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    height: 40,
  },
  headerInner: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
  },
  scriptLinkWithUpdatedAt: {
    display: 'block',
  },
  outerContainer: {
    textAlign: 'end',
  },
  containerWithUpdatedAt: {
    verticalAlign: 'bottom',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
  },
};

export default connect(state => ({
  showProjectUpdatedAt: state.project.showProjectUpdatedAt,
}))(ScriptName);
