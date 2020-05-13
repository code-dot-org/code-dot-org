import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';

const styles = {
  lessonGroupLabel: {
    fontSize: 14,
    marginRight: 5
  },
  lessonGroupInput: {
    width: 200,
    margin: '0 20px 0 0'
  },
  lessonGroupButton: {
    margin: '0 5px 0 0'
  },
  createLessonGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.cyan,
    color: color.white,
    padding: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    marginBottom: 20,
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 18
  }
};

class LessonGroupSelector extends Component {
  static propTypes = {
    confirmButtonText: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,

    // from redux
    lessonGroupMap: PropTypes.object.isRequired
  };

  state = {
    newLessonGroupKey: '',
    newLessonGroupDisplayName: ''
  };

  handleCancel = () => {
    this.setState({newLessonGroupKey: '', newLessonGroupDisplayName: ''});
    this.props.onCancel();
  };

  lessonGroupKeyUpdated = newLessonGroupKey => {
    this.setState({newLessonGroupKey});
  };

  lessonGroupDisplayNameUpdated = newLessonGroupDisplayName => {
    this.setState({newLessonGroupDisplayName});
  };

  /* do we need to check here that its not already in the list? */
  handleConfirm = () => {
    const {newLessonGroupKey, newLessonGroupDisplayName} = this.state;
    this.setState({newLessonGroupKey: '', newLessonGroupDisplayName: ''});
    let newLessonGroup = {[newLessonGroupKey]: newLessonGroupDisplayName};
    this.props.onConfirm(newLessonGroup);
  };

  render() {
    return (
      <div style={styles.createLessonGroup}>
        <div style={styles.title}>Lesson Group:</div>
        <div>
          <span style={styles.lessonGroupLabel}>Key: </span>
          &nbsp;
          <input
            style={styles.lessonGroupInput}
            onChange={e => this.lessonGroupKeyUpdated(e.target.value)}
            value={this.state.newLessonGroupKey}
          />
        </div>
        <div>
          <span style={styles.lessonGroupLabel}>Display Name:</span>
          &nbsp;
          <input
            style={styles.lessonGroupInput}
            onChange={e => this.lessonGroupDisplayNameUpdated(e.target.value)}
            value={this.state.newLessonGroupDisplayName}
          />
        </div>
        <div>
          <button
            onMouseDown={this.handleConfirm}
            className="btn btn-primary"
            style={styles.lessonGroupButton}
            type="button"
          >
            {this.props.confirmButtonText}
          </button>
          <button
            onMouseDown={this.handleCancel}
            className="btn"
            style={styles.lessonGroupButton}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  lessonGroupMap: state.lessonGroupMap
}))(LessonGroupSelector);
