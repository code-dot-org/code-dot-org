import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

const styles = {
  lessonGroupLabel: {
    fontSize: 14,
    verticalAlign: 'baseline',
    marginRight: 5
  },
  lessonGroupSelect: {
    verticalAlign: 'baseline',
    width: 550,
    margin: '0 5px 0 0'
  },
  lessonGroupButton: {
    verticalAlign: 'baseline',
    margin: '0 5px 0 0'
  }
};

class LessonGroupSelector extends Component {
  static propTypes = {
    labelText: PropTypes.string.isRequired,
    confirmButtonText: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,

    // from redux
    lessonGroups: PropTypes.array.isRequired
  };

  state = {
    newLessonGroupPosition: null
  };

  handleCancel = () => {
    this.setState({newLessonGroup: ''});
    this.props.onCancel();
  };

  lessonGroupSelected = newLessonGroupPosition => {
    this.setState({newLessonGroupPosition});
  };

  handleConfirm = () => {
    const {newLessonGroupPosition} = this.state;
    this.setState({newLessonGroupPosition: null});
    this.props.onConfirm(newLessonGroupPosition);
  };

  render() {
    const {lessonGroups} = this.props;
    return (
      <div>
        <span style={styles.lessonGroupLabel}>{this.props.labelText}:</span>
        &nbsp;
        <select
          style={styles.lessonGroupSelect}
          onChange={e => this.lessonGroupSelected(e.target.selectedIndex)}
          value={this.state.newLessonGroup}
        >
          {lessonGroups.map(lessonGroup => (
            <option key={lessonGroup.key} value={lessonGroup.display_name}>
              {lessonGroup.key}: "{lessonGroup.display_name}"
            </option>
          ))}
        </select>
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
    );
  }
}

export default connect(state => ({
  lessonGroups: state.lessonGroups
}))(LessonGroupSelector);
