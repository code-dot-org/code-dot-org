import React from 'react';
import PropTypes from 'prop-types';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import Attachments from './Attachments';

const styles = {
  textArea: {
    width: '95%'
  }
};

export default class FreeResponse extends React.Component {
  static propTypes = {
    lastAttempt: PropTypes.string,
    readOnly: PropTypes.bool,
    showUnderageWarning: PropTypes.bool,
    level: PropTypes.shape({
      placeholder: PropTypes.string,
      height: PropTypes.number,
      id: PropTypes.number,
      title: PropTypes.string,
      longInstructions: PropTypes.string,
      allow_user_uploads: PropTypes.bool
    })
  };

  render() {
    const {level, lastAttempt, readOnly, showUnderageWarning} = this.props;

    return (
      <div>
        <h1>{level.title}</h1>
        <SafeMarkdown markdown={level.longInstructions} />
        <textarea
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
