// Interface for admins to try out Foorm configurations in real-time.
// Includes a json editor with a starting configuration, along with
// a preview button to preview the configuration in Foorm

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import Foorm from './Foorm';
import FontAwesome from '../../../templates/FontAwesome';

const facilitator_names = ['Alice', 'Bob', 'Carly', 'Dave'];

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
      formPreviewQuestions: null,
      num_facilitators: 2,
      workshop_course: 'CS Principles',
      workshop_subject: '5-day Summer',
      regional_partner_name: 'Regional Partner A',
      is_virtual: true,
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
        }
      ],
      day: 1,
      is_friday_institute: false,
      workshop_agenda: 'module1'
    };
  }

  componentDidMount() {
    this.props.populateCodeMirror();
  }

  updateFacilitators = e => {
    if (this.state.num_facilitators !== e.target.value) {
      let num_facilitators = e.target.value;
      let facilitators = [];
      for (var i = 0; i < num_facilitators; i++) {
        let facilitator_name = '';
        if (i < facilitator_names.length) {
          facilitator_name = facilitator_names[i];
        } else {
          facilitator_name =
            facilitator_names[i % facilitator_names.length] + '_' + i;
        }
        facilitators.push({
          facilitator_id: i,
          facilitator_name: facilitator_name,
          facilitator_position: i + 1
        });
      }
      this.setState({
        num_facilitators: num_facilitators,
        facilitators: facilitators
      });
    }
  };

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
            <form>
              <h3>Survey Variables</h3>
              <label>
                workshop_course <br />
                <input
                  type="text"
                  value={this.state.workshop_course}
                  onChange={e =>
                    this.setState({workshop_course: e.target.value})
                  }
                />
              </label>
              <label>
                workshop_subject <br />
                <input
                  type="text"
                  value={this.state.workshop_subject}
                  onChange={e =>
                    this.setState({workshop_subject: e.target.value})
                  }
                />
              </label>
              <label>
                num_facilitators (will auto-generate facilitator names)
                <br />
                <input
                  type="number"
                  value={this.state.num_facilitators}
                  onChange={this.updateFacilitators}
                />
              </label>
              <label>
                regional_partner_name <br />
                <input
                  type="text"
                  value={this.state.regional_partner_name}
                  onChange={e =>
                    this.setState({regional_partner_name: e.target.value})
                  }
                />
              </label>
              <label>
                is_virtual <br />
                <input
                  type="boolean"
                  value={this.state.is_virtual}
                  onChange={e => this.setState({is_virtual: e.target.value})}
                />
              </label>
              <label>
                is_friday_institute <br />
                <input
                  type="boolean"
                  value={this.state.is_friday_institute}
                  onChange={e =>
                    this.setState({is_friday_institute: e.target.value})
                  }
                />
              </label>

              <label>
                day <br />
                <input
                  type="number"
                  value={this.state.day}
                  onChange={e => this.setState({day: e.target.value})}
                />
              </label>
              <label>
                workshop_agenda <br />
                <input
                  type="text"
                  value={this.state.workshop_agenda}
                  onChange={e =>
                    this.setState({workshop_agenda: e.target.value})
                  }
                />
              </label>
            </form>
            <Button onClick={this.previewFoorm}>Preview</Button>
            {this.state.formPreviewQuestions && (
              // key allows us to force re-render when preview is clicked
              <Foorm
                formQuestions={this.state.formPreviewQuestions}
                formName={'preview'}
                formVersion={0}
                submitApi={'/none'}
                key={`form-${this.state.formKey}`}
                surveyData={{
                  facilitators: this.state.facilitators,
                  num_facilitators: this.state.num_facilitators,
                  workshop_course: this.state.workshop_course,
                  workshop_subject: this.state.workshop_subject,
                  regional_partner_name: this.state.regional_partner_name,
                  is_virtual: this.state.is_virtual,
                  day: this.state.day,
                  is_friday_institute: this.state.is_friday_institute,
                  workshop_agenda: this.state.workshop_agenda
                }}
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
