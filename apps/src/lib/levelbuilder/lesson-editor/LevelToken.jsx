import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Motion, spring} from 'react-motion';
import color from '@cdo/apps/util/color';
import {
  borderRadius,
  levelTokenMargin
} from '@cdo/apps/lib/levelbuilder/constants';
import {levelShape} from '@cdo/apps/lib/levelbuilder/shapes';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import LevelTokenDetails from '@cdo/apps/lib/levelbuilder/lesson-editor/LevelTokenDetails';
import {toggleExpand} from '@cdo/apps/lib/levelbuilder/script-editor/editorRedux';

const styles = {
  levelToken: {
    fontSize: 13,
    position: 'relative',
    background: '#eee',
    borderRadius: borderRadius,
    margin: `${levelTokenMargin}px 0`
  },
  reorder: {
    fontSize: 16,
    display: 'table-cell',
    background: '#ddd',
    border: '1px solid #bbb',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    padding: '7px 15px',
    borderTopLeftRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
    cursor: 'ns-resize'
  },
  levelTokenName: {
    padding: 7,
    display: 'table-cell',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
    width: '100%',
    borderTop: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer'
  },
  tag: {
    color: 'white',
    background: color.purple,
    padding: '3px 5px',
    lineHeight: '12px',
    borderRadius: 5,
    marginLeft: 3
  },
  remove: {
    fontSize: 14,
    display: 'table-cell',
    color: 'white',
    background: '#c00',
    border: '1px solid #a00',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    padding: '7px 13px',
    borderTopRightRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    cursor: 'pointer'
  },
  edit: {
    fontSize: 14,
    display: 'table-cell',
    color: 'white',
    background: color.teal,
    border: '1px solid #00adbc',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
    padding: '7px 13px',
    cursor: 'pointer'
  },
  levelArea: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleAndBubble: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  levelTitle: {
    marginLeft: 5
  }
};

/**
 * Component for editing puzzle dots with one or more level variants.
 */
class LevelToken extends Component {
  static propTypes = {
    activitySectionPosition: PropTypes.number.isRequired,
    activityPosition: PropTypes.number.isRequired,
    level: levelShape.isRequired,
    dragging: PropTypes.bool,
    draggedLevelPos: PropTypes.bool,
    delta: PropTypes.number,
    handleDragStart: PropTypes.func,

    //redux
    levelKeyList: PropTypes.object.isRequired,
    toggleExpand: PropTypes.func,
    removeLevel: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      expand: false
    };
  }

  handleDragStart = e => {
    this.props.handleDragStart(this.props.level.position, e);
  };

  toggleExpand = () => {
    this.setState({expand: !this.state.expand});
  };

  handleRemove = () => {
    this.props.removeLevel(this.props.level.position);
  };

  render() {
    const {draggedLevelPos} = this.props;
    const springConfig = {stiffness: 1000, damping: 80};
    return (
      <Motion
        style={
          draggedLevelPos
            ? {
                y: this.props.dragging ? this.props.delta : 0,
                scale: spring(1.02, springConfig),
                shadow: spring(5, springConfig)
              }
            : {
                y: this.props.dragging
                  ? spring(this.props.delta, springConfig)
                  : 0,
                scale: 1,
                shadow: 0
              }
        }
        key={this.props.level.position}
      >
        {// Use react-motion to interpolate the following values and create
        // smooth transitions.
        ({y, scale, shadow}) => (
          <div
            style={Object.assign({}, styles.levelToken, {
              transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
              boxShadow: `${color.shadow} 0 ${shadow}px ${shadow * 3}px`,
              zIndex: draggedLevelPos ? 1000 : 500 - this.props.level.position
            })}
          >
            <div style={styles.reorder} onMouseDown={this.handleDragStart}>
              <i className="fa fa-arrows-v" />
            </div>
            <span style={styles.levelTokenName} onMouseDown={this.toggleExpand}>
              <span style={styles.levelArea}>
                <span style={styles.titleAndBubble}>
                  <ProgressBubble
                    hideToolTips={true}
                    level={this.props.level}
                    disabled={true}
                  />
                  <span style={styles.levelTitle}>{this.props.level.name}</span>
                </span>
                {this.props.level.named && (
                  <span style={styles.tag}>named</span>
                )}
                {this.props.level.assessment && (
                  <span style={styles.tag}>assessment</span>
                )}
              </span>
            </span>
            <div
              style={styles.edit}
              onClick={() => {
                const win = window.open(this.props.level.url, '_blank');
                win.focus();
              }}
            >
              <i className="fa fa-pencil" />
            </div>
            <div style={styles.remove} onMouseDown={this.handleRemove}>
              <i className="fa fa-times" />
            </div>
            {this.state.expand && (
              <LevelTokenDetails
                level={this.props.level}
                activitySectionPosition={this.props.activitySectionPosition}
                activityPosition={this.props.activityPosition}
              />
            )}
          </div>
        )}
      </Motion>
    );
  }
}

export default connect(
  state => ({
    levelKeyList: state.levelKeyList
  }),
  {
    toggleExpand
  }
)(LevelToken);
