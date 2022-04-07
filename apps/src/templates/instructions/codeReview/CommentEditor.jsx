import React, {Component} from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import javalabMsg from '@cdo/javalab/locale';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import TextAreaWithCode from '@cdo/apps/templates/instructions/codeReview/TextAreaWithCode';
import TextAreaWithCodeButton from '@cdo/apps/templates/instructions/codeReview/TextAreaWithCodeButton';
// import CodeMirror from 'codemirror';
// import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';

export default class CommentEditor extends Component {
  static propTypes = {
    onNewCommentSubmit: PropTypes.func.isRequired,
    onNewCommentCancel: PropTypes.func.isRequired,
    onCommentUpdate: PropTypes.func,
    saveError: PropTypes.bool,
    saveInProgress: PropTypes.bool,
    saveErrorMessage: PropTypes.string
  };

  state = {comment: ''};

  componentDidMount() {
    this.codeMirror = new EditorView({
      state: EditorState.create({
        doc: 'temp',
        extensions: []
      }),
      parent: this.codeMirror
    });
  }

  commentChanged = event => {
    this.props.onCommentUpdate();
    this.setState({comment: event.target.value});
  };

  renderSaveStatus() {
    const {saveError, saveInProgress, saveErrorMessage} = this.props;
    let icon = '';
    let saveMessageTitle = '';
    let saveMessageText = '';

    if (saveInProgress) {
      icon = <Spinner size="small" style={styles.spinner} />;
      saveMessageTitle = javalabMsg.saving();
    } else if (saveError) {
      icon = (
        <span className="fa fa-exclamation-circle" style={styles.iconError} />
      );
      saveMessageTitle = javalabMsg.genericSaveErrorTitle();
      saveMessageText = saveErrorMessage || javalabMsg.genericErrorMessage();
    }

    return (
      <div style={styles.saveStatus}>
        <div style={styles.saveStatusHeader}>
          <div style={styles.saveStatusIcon}>{icon}</div>
          <p style={styles.saveMessageTitle}>{saveMessageTitle}</p>
        </div>
        <p style={styles.saveMessageText}>{saveMessageText}</p>
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
        <div
          ref={el => (this.codeMirror = el)}
          style={{
            border: '1px solid blue',
            fontFamily: '"Gotham 5r", sans-serif'
          }}
        />
        <TextAreaWithCodeButton />
        <TextAreaWithCode />
        <textarea
          className="code-review-comment-input"
          style={{width: '100%', boxSizing: 'border-box'}}
          placeholder={`${javalabMsg.addAComment()}...`}
          onChange={this.commentChanged}
          value={this.state.comment}
        />
        {comment && this.renderSaveStatus()}
        <div style={styles.commentFooter}>
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
                id="code-review-comment-submit"
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '10px 0'
  },
  saveStatus: {
    display: 'flex',
    flexDirection: 'column'
  },
  saveStatusHeader: {
    display: 'flex',
    alignItems: 'center'
  },
  saveMessageTitle: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    marginBottom: 0,
    color: color.dark_charcoal
  },
  saveMessageText: {
    fontStyle: 'italic',
    fontSize: 12,
    marginBottom: 0,
    color: color.dark_charcoal
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
