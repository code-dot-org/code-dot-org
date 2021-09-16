import React, {Component} from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import javalabMsg from '@cdo/javalab/locale';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

export default class CommentEditor extends Component {
  static propTypes = {
    onNewCommentSubmit: PropTypes.func.isRequired,
    onNewCommentCancel: PropTypes.func.isRequired,
    saveError: PropTypes.bool,
    saveInProgress: PropTypes.bool
  };

  state = {comment: ''};

  commentChanged = event => this.setState({comment: event.target.value});

  renderSaveStatus() {
    const {saveError, saveInProgress} = this.props;
    let icon = '';
    let saveMessageTitle = '';
    let saveMessageText = '';

    if (saveInProgress) {
      icon = <span className="fa fa-spin fa-spinner" style={styles.spinner} />;
      saveMessageTitle = javalabMsg.saving();
    } else if (saveError) {
      icon = (
        <span className="fa fa-exclamation-circle" style={styles.iconError} />
      );
      saveMessageTitle = javalabMsg.genericSaveErrorTitle();
      saveMessageText = javalabMsg.genericErrorMessage();
    }

    return (
      <div style={styles.saveStatus}>
        <div style={styles.saveStatusIcon}>{icon}</div>
        <div style={styles.saveMessage}>
          <div style={styles.saveMessageTitle}>{saveMessageTitle}</div>
          <div style={styles.saveMessageText}>{saveMessageText}</div>
        </div>
      </div>
    );
  }

  onCommentCancel = () => {
    this.setState({comment: ''});
    this.props.onNewCommentCancel();
  };

  render() {
    const {comment} = this.state;
    const {saveInProgress} = this.props;

    return (
      <div>
        <textarea
          style={{width: '100%', boxSizing: 'border-box'}}
          placeholder={`${javalabMsg.addAComment()}...`}
          onChange={this.commentChanged}
          value={this.state.comment}
        />
        <div style={styles.commentFooter}>
          {comment && this.renderSaveStatus()}
          <div style={styles.buttonContainer}>
            {comment && (
              <Button
                key="cancel"
                text={msg.cancel()}
                onClick={this.onCommentCancel}
                color="gray"
                style={{...styles.buttons.all, ...styles.buttons.cancel}}
                disabled={saveInProgress}
              />
            )}
            {comment && (
              <Button
                key="submit"
                text={msg.submit()}
                onClick={() => this.props.onNewCommentSubmit(comment)}
                color="orange"
                style={{...styles.buttons.all, ...styles.buttons.submit}}
                disabled={saveInProgress}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

const PADDING = 8;

const styles = {
  buttons: {
    all: {
      boxShadow: 'none',
      fontSize: '14px',
      padding: '5px 16px'
    },
    submit: {
      fontFamily: '"Gotham 5r"',
      borderColor: color.orange
    },
    cancel: {
      fontFamily: '"Gotham 4r"',
      borderColor: color.lightest_gray
    }
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  commentFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0'
  },
  saveStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  saveMessageTitle: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14
  },
  saveMessageText: {
    fontStyle: 'italic',
    fontSize: 12
  },
  saveMessage: {
    color: color.dark_charcoal
  },
  spinner: {
    color: color.dark_charcoal,
    fontSize: 28
  },
  saveStatusIcon: {
    paddingRight: PADDING
  },
  iconError: {
    color: color.light_orange,
    fontSize: 30
  }
};
