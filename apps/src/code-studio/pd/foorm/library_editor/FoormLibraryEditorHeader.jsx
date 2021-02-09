// Metadata and buttons for the Foorm Editor. Shows form name and version,
// live preview toggle, and validate button/validation status.
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import {Button} from 'react-bootstrap';
import Spinner from '../../components/spinner';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import moment from 'moment';
import {connect} from 'react-redux';

const styles = {
  surveyTitle: {
    marginBottom: 0
  },
  validationInfo: {
    marginTop: 10,
    marginLeft: 10
  },
  validateButton: {
    marginLeft: 0
  },
  spinner: {
    marginTop: 5
  },
  validation: {
    display: 'flex'
  },
  helperButtons: {
    marginTop: 15,
    marginBottom: 15
  },
  livePreview: {
    marginTop: 8
  }
};

const PREVIEW_ON = 'preview-on';
const PREVIEW_OFF = 'preview-off';
const TIME_FORMAT = 'h:mm a';

class FoormEditorHeader extends Component {
  static propTypes = {
    livePreviewToggled: PropTypes.func,
    livePreviewStatus: PropTypes.string,

    // populated by Redux
    libraryQuestion: PropTypes.object,
    libraryQuestionName: PropTypes.string,
    libraryName: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      lastValidated: null,
      validationError: null,
      validationStarted: false
    };
  }

  validateQuestions = () => {
    this.setState({validationStarted: true});
    $.ajax({
      url: '/api/v1/pd/foorm/library_questions/validate_library_question',
      type: 'post',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify({
        question: this.props.libraryQuestion
      })
    })
      .done(result => {
        this.setState({
          lastValidated: moment().format(TIME_FORMAT),
          validationError: null,
          validationStarted: false
        });
      })
      .fail(result => {
        this.setState({
          lastValidated: moment().format(TIME_FORMAT),
          validationError:
            (result.responseJSON && result.responseJSON.error) ||
            'Unknown error.',
          validationStarted: false
        });
      });
  };

  render() {
    // need to get this header to show when a "new library" is selected
    return (
      <div>
        {this.props.libraryName && (
          <div>
            <h2 style={styles.surveyTitle}>
              {`Library Name: ${this.props.libraryName}`}
              <br />
              {`Library Question Name: ${this.props.libraryQuestionName}`}
            </h2>
          </div>
        )}
        <div style={styles.helperButtons}>
          <div style={styles.livePreview}>
            <ToggleGroup
              onChange={this.props.livePreviewToggled}
              selected={this.props.livePreviewStatus}
            >
              <button type="button" value={PREVIEW_ON}>
                Live Preview On
              </button>
              <button type="button" value={PREVIEW_OFF}>
                Live Preview Off
              </button>
            </ToggleGroup>
          </div>
          <div style={styles.validation}>
            <Button
              style={styles.validateButton}
              onClick={this.validateQuestions}
              className="btn"
            >
              Validate
            </Button>
            <br />
            {this.state.validationStarted ? (
              <Spinner style={styles.spinner} />
            ) : (
              this.state.lastValidated && (
                <div style={styles.validationInfo}>
                  {this.state.validationError && (
                    <FontAwesome icon="exclamation-triangle" />
                  )}
                  {` Form was last validated at ${
                    this.state.lastValidated
                  }. Validation status: ${
                    this.state.validationError ? 'Invalid.' : 'Valid.'
                  }`}
                  <br />
                  {this.state.validationError &&
                    `Validation error: ${this.state.validationError}`}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  libraryQuestion: state.foorm.libraryQuestion || {},
  libraryQuestionName: state.foorm.libraryQuestionName,
  libraryName: state.foorm.libraryName
}))(FoormEditorHeader);
