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
    libraryError: PropTypes.bool,
    libraryErrorMessage: PropTypes.string,
    formPreviewQuestions: PropTypes.object,
    formKey: PropTypes.number,
    surveyData: PropTypes.object,
    errorMessages: PropTypes.array,

    // Populated by Redux
    formHasError: PropTypes.bool
  };

  renderErrorMessages() {
    return this.props.errorMessages.map((errorMessage, i) => {
      return (
        <div style={styles.errorMessage} key={i}>
          <FontAwesome icon="exclamation-triangle" /> {errorMessage}
        </div>
      );
    });
  }

  render() {
    return (
      <div className="foorm-preview">
        <div style={styles.previewBox}>
          {this.renderErrorMessages()}
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
                inEditorMode={true}
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
