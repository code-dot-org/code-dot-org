// Preview panel for Foorm editor.
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Foorm from '../Foorm';
import {connect} from 'react-redux';

const styles = {
  previewBox: {
    border: '1px solid #eee'
  },
  errorMessage: {
    fontWeight: 'bold',
    padding: '1em'
  }
};

class FoormEditorPreview extends Component {
  static propTypes = {
    formHasError: PropTypes.bool,
    libraryError: PropTypes.bool,
    libraryErrorMessage: PropTypes.string,
    formPreviewQuestions: PropTypes.object,
    formKey: PropTypes.number,
    surveyData: PropTypes.object
  };

  render() {
    return (
      <div className="foorm-preview">
        <div style={styles.previewBox}>
          {this.props.formHasError && (
            <div style={styles.errorMessage}>
              <FontAwesome icon="exclamation-triangle" /> There is a parsing
              error in the survey configuration. Errors are noted on the left
              side of the editor.
            </div>
          )}
          {this.props.libraryError && (
            <div style={styles.errorMessage}>
              <FontAwesome icon="exclamation-triangle" />
              {`There is an error in the use of at least one library question. The error is: ${
                this.props.libraryErrorMessage
              }`}
            </div>
          )}
          {this.props.formPreviewQuestions &&
            !this.props.formHasError &&
            !this.props.libraryError && (
              // key allows us to force re-render when preview is called
              <Foorm
                formQuestions={this.props.formPreviewQuestions}
                formName={'preview'}
                formVersion={0}
                submitApi={'/none'}
                key={`form-${this.props.formKey}`}
                surveyData={this.props.surveyData}
              />
            )}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  formHasError: state.foorm.hasError
}))(FoormEditorPreview);
