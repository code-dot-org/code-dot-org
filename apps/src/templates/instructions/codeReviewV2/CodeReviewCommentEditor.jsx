import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';
import CodeReviewError from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewError';

const CodeReviewCommentEditor = ({addCodeReviewComment}) => {
  const [commentText, setCommentText] = useState('');
  const [displayAddCommentFailure, setDisplayAddCommentFailure] = useState(
    false
  );
  const [addCommentFailureMessage, setAddCommentFailureMessage] = useState(
    null
  );

  const handleSubmit = () => {
    addCodeReviewComment(commentText, onSubmitSuccess, onSubmitFailure);
  };

  const onSubmitSuccess = () => {
    clearTextBox();
    setDisplayAddCommentFailure(false);
  };

  const clearTextBox = () => {
    setCommentText('');
  };

  const onSubmitFailure = err => {
    if (err.profanityFoundError) {
      setAddCommentFailureMessage(err.profanityFoundError);
    } else {
      setAddCommentFailureMessage(null);
    }
    setDisplayAddCommentFailure(true);
  };

  return (
    <>
      <textarea
        placeholder={javalabMsg.addACommentToReview()}
        rows={3}
        value={commentText}
        onChange={e => setCommentText(e.target.value)}
        style={styles.textarea}
      />
      <div style={styles.submit}>
        {displayAddCommentFailure && (
          <CodeReviewError
            messageText={addCommentFailureMessage}
            style={styles.error}
          />
        )}
        <Button
          disabled={commentText.length === 0}
          onClick={handleSubmit}
          text={javalabMsg.submit()}
          color={Button.ButtonColor.orange}
          style={styles.submitButton}
        />
      </div>
    </>
  );
};

CodeReviewCommentEditor.propTypes = {
  addCodeReviewComment: PropTypes.func.isRequired
};

export default CodeReviewCommentEditor;

const styles = {
  wrapper: {
    border: `1px solid ${color.droplet_bright_blue}`,
    borderRadius: '4px'
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  submit: {
    display: 'flex',
    alignItems: 'end',
    flexDirection: 'column'
  },
  submitButton: {
    marginTop: '10px'
  },
  error: {
    marginTop: '8px'
  }
};
