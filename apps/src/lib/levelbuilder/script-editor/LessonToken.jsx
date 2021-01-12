import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Motion, spring} from 'react-motion';
import color from '@cdo/apps/util/color';
import {borderRadius, tokenMargin} from '@cdo/apps/lib/levelbuilder/constants';
import {lessonShape} from '@cdo/apps/lib/levelbuilder/shapes';

const styles = {
  lessonToken: {
    fontSize: 13,
    position: 'relative',
    background: '#eee',
    borderRadius: borderRadius,
    margin: `${tokenMargin}px 0`
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
  lessonTokenName: {
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
  lessonArea: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  lessonDetails: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  lessonTitle: {
    marginLeft: 5
  }
};

/**
 * Component for editing lessons
 */
export default class LessonToken extends Component {
  static propTypes = {
    lessonGroupPosition: PropTypes.number.isRequired,
    lesson: lessonShape.isRequired,
    dragging: PropTypes.bool,
    draggedLessonPos: PropTypes.bool,
    delta: PropTypes.number,
    handleDragStart: PropTypes.func,
    removeLesson: PropTypes.func.isRequired
  };

  handleDragStart = e => {
    this.props.handleDragStart(this.props.lesson.position, e);
  };

  handleRemove = () => {
    this.props.removeLesson(this.props.lesson.position);
  };

  render() {
    const {draggedLessonPos} = this.props;
    const springConfig = {stiffness: 1000, damping: 80};
    return (
      <Motion
        style={
          draggedLessonPos
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
        key={this.props.lesson.position}
      >
        {// Use react-motion to interpolate the following values and create
        // smooth transitions.
        ({y, scale, shadow}) => (
          <div
            style={Object.assign({}, styles.lessonToken, {
              transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
              boxShadow: `${color.shadow} 0 ${shadow}px ${shadow * 3}px`,
              zIndex: draggedLessonPos ? 1000 : 500 - this.props.lesson.position
            })}
          >
            <div style={styles.reorder} onMouseDown={this.handleDragStart}>
              <i className="fa fa-arrows-v" />
            </div>
            <span style={styles.lessonTokenName}>
              <span style={styles.lessonArea}>
                <span style={styles.lessonTitle}>{this.props.lesson.name}</span>
                <span style={styles.lessonDetails}>
                  {this.props.lesson.unplugged && (
                    <span style={styles.tag}>unplugged</span>
                  )}
                  {this.props.lesson.assessment && (
                    <span style={styles.tag}>assessment</span>
                  )}
                  {!this.props.lesson.hasLessonPlan && (
                    <span style={styles.tag}>no lesson plan</span>
                  )}
                  {this.props.lesson.lockable && (
                    <span style={styles.tag}>lockable</span>
                  )}
                </span>
              </span>
            </span>
            {this.props.lesson.id && (
              <div
                style={styles.edit}
                onClick={() => {
                  window.lessonEditorOpened = true;
                  const win = window.open(
                    `/lessons/${this.props.lesson.id}/edit`,
                    '_blank'
                  );
                  win.focus();
                }}
              >
                <i className="fa fa-pencil" />
              </div>
            )}
            <div style={styles.remove} onMouseDown={this.handleRemove}>
              <i className="fa fa-times" />
            </div>
          </div>
        )}
      </Motion>
    );
  }
}
