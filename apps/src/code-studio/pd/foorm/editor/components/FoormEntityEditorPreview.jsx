import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Foorm from '../../Foorm';
import {connect} from 'react-redux';

// Preview panel for Foorm editor.
class FoormEntityEditorPreview extends Component {
  static propTypes = {
    previewQuestions: PropTypes.object,
    forceRerenderKey: PropTypes.number,
    foormData: PropTypes.object,
    errorMessages: PropTypes.array,

    // Populated by Redux
    hasJSONError: PropTypes.bool
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
    const {previewQuestions, errorMessages} = this.props;

    return (
      <div style={styles.previewBox}>
        {this.renderErrorMessages()}
        {previewQuestions &&
          !this.props.hasJSONError &&
          !(errorMessages && errorMessages.length) && (
            // key allows us to force re-render when preview is called
            <Foorm
              formQuestions={previewQuestions}
              formName={'preview'}
              formVersion={0}
              submitApi={'/none'}
              key={`form-${this.props.forceRerenderKey}`}
              surveyData={this.props.foormData}
              inEditorMode={true}
            />
          )}
      </div>
    );
  }
}

const styles = {
  previewBox: {
    border: '1px solid #eee'
  },
  errorMessage: {
    fontWeight: 'bold',
    padding: '1em'
  }
};

export default connect(state => ({
  hasJSONError: state.foorm.hasJSONError
}))(FoormEntityEditorPreview);
