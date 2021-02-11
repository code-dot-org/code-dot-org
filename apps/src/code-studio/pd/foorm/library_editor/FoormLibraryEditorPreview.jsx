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

class FoormLibraryEditorPreview extends Component {
  static propTypes = {
    libraryError: PropTypes.bool,
    libraryErrorMessage: PropTypes.string,
    libraryQuestionPreviewQuestion: PropTypes.object,
    libraryQuestionKey: PropTypes.number,
    surveyData: PropTypes.object,

    // Populated by Redux
    libraryQuestionHasError: PropTypes.bool
  };

  wrapLibraryQuestionPreviewQuestion = () => {
    return {
      elements: [this.props.libraryQuestionPreviewQuestion]
    };
  };

  render() {
    return (
      <div className="foorm-preview">
        <div style={styles.previewBox}>
          {this.props.libraryQuestionHasError && (
            <div style={styles.errorMessage}>
              <FontAwesome icon="exclamation-triangle" /> There is a parsing
              error in the library question configuration. Errors are noted on
              the left side of the editor.
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
          {this.props.libraryQuestionPreviewQuestion &&
            !this.props.libraryQuestionHasError &&
            !this.props.libraryError && (
              // key allows us to force re-render when preview is called
              <Foorm
                formQuestions={this.wrapLibraryQuestionPreviewQuestion()}
                formName={'preview'}
                formVersion={0}
                submitApi={'/none'}
                key={`form-${this.props.libraryQuestionKey}`}
                surveyData={this.props.surveyData}
                inEditorMode={true}
              />
            )}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  libraryQuestionHasError: state.foorm.hasError
}))(FoormLibraryEditorPreview);
