// Preview panel for Foorm editor.
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Foorm from '../../Foorm';
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

class FoormEntityEditorPreview extends Component {
  static propTypes = {
    previewQuestions: PropTypes.object,
    forceRerenderKey: PropTypes.number,
    surveyData: PropTypes.object,
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
    return (
      <div className="foorm-preview">
        <div style={styles.previewBox}>
          {this.renderErrorMessages()}
          {this.props.previewQuestions &&
            !this.props.hasJSONError &&
            !(this.props.errorMessages && this.props.errorMessages.length) && (
              // key allows us to force re-render when preview is called
              <Foorm
                formQuestions={this.props.previewQuestions}
                formName={'preview'}
                formVersion={0}
                submitApi={'/none'}
                key={`form-${this.props.forceRerenderKey}`}
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
  hasJSONError: state.foorm.hasJSONError
}))(FoormEntityEditorPreview);
