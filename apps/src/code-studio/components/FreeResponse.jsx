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
      title: PropTypes.string,
      allow_user_uploads: PropTypes.bool
    }),

    //redux
    freeResponseTextAreaHeight: PropTypes.number,
    freeResponsePlaceholder: PropTypes.string,
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
        {this.props.level.title && (
          <h1 className="free-response-title">{level.title}</h1>
        )}
        <SafeMarkdown markdown={instructions} />
        <textarea
          className="free-response-textarea"
          placeholder={this.props.freeResponsePlaceholder}
          style={{
            ...styles.textArea,
            ...{height: this.props.freeResponseTextAreaHeight}
          }}
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
  showUnderageWarning: state.pageConstants.is13Plus,
  freeResponsePlaceholder: state.instructions.freeResponsePlaceholder,
  freeResponseTextAreaHeight: state.instructions.freeResponseTextAreaHeight
}))(FreeResponse);
