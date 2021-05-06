import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';
import {Button} from 'react-bootstrap';
import Spinner from '../../../components/spinner';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import moment from 'moment';
import {connect} from 'react-redux';

const PREVIEW_ON = 'preview-on';
const PREVIEW_OFF = 'preview-off';
const TIME_FORMAT = 'h:mm a';

// Metadata and buttons for the Foorm Editor. Shows name and version,
// live preview toggle, and validate button/validation status.
class FoormEntityEditorHeader extends Component {
  static propTypes = {
    livePreviewToggled: PropTypes.func,
    livePreviewStatus: PropTypes.string,
    validateURL: PropTypes.string,
    validateDataKey: PropTypes.string,
    headerTitle: PropTypes.node,

    // populated by Redux
    questions: PropTypes.object
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
      url: this.props.validateURL,
      type: 'post',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify({
        [this.props.validateDataKey]: this.props.questions
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
    return (
      <div>
        {this.props.headerTitle}
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
                  {`Last validated at ${
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

const styles = {
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

export default connect(state => ({
  questions: state.foorm.questions || {}
}))(FoormEntityEditorHeader);
