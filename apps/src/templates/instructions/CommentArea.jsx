import React, {Component} from 'react';
import i18n from '@cdo/locale';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

const styles = {
  textInput: {
    marginTop: 0,
    marginBottom: 16,
    display: 'block',
    width: '90%'
  },
  textInputStudent: {
    margin: 10,
    display: 'block',
    width: '90%',
    backgroundColor: color.lightest_cyan
  },
  time: {
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center'
  },
  studentTime: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  h1: {
    color: color.charcoal,
    marginTop: 8,
    marginBottom: 12,
    fontSize: 24,
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal'
  }
};

export class CommentArea extends Component {
  static propTypes = {
    disabledMode: PropTypes.bool,
    comment: PropTypes.string,
    placeholderText: PropTypes.string,
    studentHasFeedback: PropTypes.bool,
    feedbackTimeStamp: PropTypes.string,
    onCommentChange: PropTypes.func
  };

  commentChanged = event => {
    this.props.onCommentChange(event.target.value);
  };

  render() {
    return (
      <div>
        <div style={styles.studentTime}>
          <h1 style={styles.h1}>Teacher Feedback</h1>
          {this.props.studentHasFeedback && (
            <div style={styles.time} id="ui-test-feedback-time">
              {i18n.lastUpdated({
                time: moment
                  .min(moment(), moment(this.props.feedbackTimeStamp))
                  .fromNow()
              })}
            </div>
          )}
        </div>
        <textarea
          id="ui-test-feedback-input"
          style={
            this.props.disabledMode ? styles.textInputStudent : styles.textInput
          }
          onChange={this.commentChanged}
          placeholder={this.props.placeholderText}
          value={this.props.comment}
          readOnly={this.props.disabledMode}
        />
      </div>
    );
  }
}
