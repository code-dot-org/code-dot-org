// Interface for admins to try out Foorm configurations in real-time.
// Includes a json editor with a starting configuration, along with
// a preview button to preview the configuration in Foorm

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import Foorm from './Foorm';
import FontAwesome from '../../../templates/FontAwesome';

const sampleSurveyData = {
  facilitators: [
    {
      facilitator_id: 1,
      facilitator_name: 'Alice',
      facilitator_position: 1
    },
    {
      facilitator_id: 2,
      facilitator_name: 'Bob',
      facilitator_position: 2
    },
    {
      facilitator_id: 3,
      facilitator_name: 'Chris',
      facilitator_position: 3
    }
  ],
  workshop_course: 'Sample Course',
  workshop_subject: 'Sample Subject',
  regional_partner_name: 'Regional Partner A',
  is_virtual: false,
  num_facilitators: 3
};

const styles = {
  errorMessage: {
    fontWeight: 'bold',
    padding: '1em'
  }
};

class FoormEditor extends React.Component {
  static propTypes = {
    populateCodeMirror: PropTypes.func.isRequired,
    formName: PropTypes.string,
    formVersion: PropTypes.number,
    // populated by redux
    formQuestions: PropTypes.object,
    formHasError: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      formKey: 0,
      formPreviewQuestions: null
    };
  }

  componentDidMount() {
    this.props.populateCodeMirror();
  }

  previewFoorm = () => {
    // fill in form with any library items
    $.ajax({
      url: '/api/v1/pd/foorm/form_with_library_items',
      type: 'post',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify({
        form_questions: this.props.formQuestions
      })
    }).done(result => {
      this.setState({
        formKey: this.state.formKey + 1,
        formPreviewQuestions: result
      });
    });
  };

  render() {
    return (
      <div>
        {this.props.formName && (
          <h3>{`${this.props.formName}, version ${this.props.formVersion}`}</h3>
        )}
        {/* textarea is filled by populateCodeMirror()*/}
        <textarea
          ref="content"
          // 3rd parameter specifies number of spaces to insert
          // into the output JSON string for readability purposes.
          // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
          value={JSON.stringify(this.props.formQuestions, null, 2)}
          // Change handler is required for this element, but changes will be handled by the code mirror.
          onChange={() => {}}
        />
        {this.props.formHasError ? (
          <div style={styles.errorMessage}>
            <FontAwesome icon="exclamation-triangle" /> There is a parsing error
            in the survey configuration. Errors are noted on the left side of
            the editor.
          </div>
        ) : (
          <div>
            <Button onClick={this.previewFoorm}>Preview</Button>
            {this.state.formPreviewQuestions && (
              // key allows us to force re-render when preview is clicked
              <Foorm
                formQuestions={this.state.formPreviewQuestions}
                formName={'preview'}
                formVersion={0}
                submitApi={'/none'}
                key={`form-${this.state.formKey}`}
                surveyData={sampleSurveyData}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    formQuestions: state.foorm.formQuestions || {},
    formHasError: state.foorm.hasError
  }),
  dispatch => ({})
)(FoormEditor);
