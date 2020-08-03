import React from 'react';
import PropTypes from 'prop-types';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import Attachments from './Attachments';
import {connect} from 'react-redux';

const styles = {
  textArea: {
    width: '95%'
  }
};

class FreeResponse extends React.Component {
  static propTypes = {
    hidden: PropTypes.bool,

    lastAttempt: PropTypes.string,
    level: PropTypes.shape({
      placeholder: PropTypes.string,
      height: PropTypes.number,
      id: PropTypes.number,
      title: PropTypes.string,
      allow_user_uploads: PropTypes.bool
    }),

    //redux
    showUnderageWarning: PropTypes.bool,
    readOnly: PropTypes.bool,
    instructions: PropTypes.string
  };

  render() {
    const {
      level,
      lastAttempt,
      readOnly,
      showUnderageWarning,
      instructions
    } = this.props;

    return (
      <div hidden={this.props.hidden}>
        <h1 className="free-response-title">{level.title}</h1>
        <SafeMarkdown markdown={instructions} />
        <textarea
          className="free-response-textarea"
          id={`level_${level.id}`}
          placeholder={level.placeholder}
          style={styles.textArea}
          height={level.height}
          readOnly={readOnly}
        >
          {lastAttempt}
        </textarea>
        {level.allow_user_uploads && (
          <Attachments
            readOnly={readOnly}
            showUnderageWarning={showUnderageWarning}
          />
        )}
      </div>
    );
  }
}

export default connect(state => ({
  instructions: state.instructions.longInstructions,
  readOnly: state.pageConstants.isReadOnlyWorkspace,
  showUnderageWarning: state.pageConstants.is13Plus
}))(FreeResponse);
