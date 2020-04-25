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
    lessonGroupMap: PropTypes.object.isRequired
  };

  state = {
    newLessonGroup: ''
  };

  handleCancel = () => {
    this.setState({newLessonGroup: ''});
    this.props.onCancel();
  };

  lessonGroupSelected = newLessonGroup => {
    this.setState({newLessonGroup});
  };

  handleConfirm = () => {
    const {newLessonGroup} = this.state;
    this.setState({newLessonGroup: ''});
    this.props.onConfirm(newLessonGroup);
  };

  render() {
    const {lessonGroupMap} = this.props;
    return (
      <div>
        <span style={styles.lessonGroupLabel}>{this.props.labelText}:</span>
        &nbsp;
        <select
          style={styles.lessonGroupSelect}
          onChange={e => this.lessonGroupSelected(e.target.value)}
          value={this.state.newLessonGroup}
        >
          <option value="">(none): "Content"</option>
          {Object.keys(lessonGroupMap).map(lessonGroup => (
            <option key={lessonGroup} value={lessonGroup}>
              {lessonGroup}: "{lessonGroupMap[lessonGroup]}"
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
  lessonGroupMap: state.lessonGroupMap
}))(LessonGroupSelector);
