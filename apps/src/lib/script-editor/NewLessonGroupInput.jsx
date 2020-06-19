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

class NewLessonGroupInput extends Component {
  static propTypes = {
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,

    // from redux
    lessonGroups: PropTypes.array.isRequired
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

  handleConfirm = () => {
    const {newLessonGroupKey, newLessonGroupDisplayName} = this.state;
    if (!this.props.lessonGroups.some(lg => lg.key === newLessonGroupKey)) {
      this.setState({newLessonGroupKey: '', newLessonGroupDisplayName: ''});
      this.props.onConfirm(newLessonGroupKey, newLessonGroupDisplayName);
    }
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
            Create
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

export const UnconnectedNewLessonGroupInput = NewLessonGroupInput;

export default connect(state => ({
  lessonGroups: state.lessonGroups
}))(NewLessonGroupInput);
