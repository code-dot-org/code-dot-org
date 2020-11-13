// Interface for admins to try out Foorm configurations in real-time.
// Includes a json editor with a starting configuration, along with
// a preview button to preview the configuration in Foorm

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Foorm from './Foorm';
import FontAwesome from '../../../templates/FontAwesome';
import ToggleGroup from '@cdo/apps/templates/ToggleGroup';

const facilitator_names = ['Alice', 'Bob', 'Carly', 'Dave'];

const styles = {
  errorMessage: {
    fontWeight: 'bold',
    padding: '1em'
  },
  foormEditor: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%'
  },
  editor: {
    minWidth: 560
  },
  options: {
    minWidth: 215,
    maxWidth: 255
  },
  preview: {
    width: '45%',
    marginRight: 12
  },
  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  editorAndOptions: {
    minWidth: 560,
    display: 'flex',
    flexDirection: 'column',
    width: '45%',
    marginRight: 12
  },
  previewBox: {
    border: '1px solid #eee'
  }
};

const PREVIEW_ON = 'preview-on';
const PREVIEW_OFF = 'preview-off';

class FoormEditor extends React.Component {
  static propTypes = {
    populateCodeMirror: PropTypes.func.isRequired,
    formName: PropTypes.string,
    formVersion: PropTypes.number,
    // populated by redux
    formQuestions: PropTypes.object,
    formHasError: PropTypes.bool,
    isFormPublished: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      livePreviewStatus: PREVIEW_ON,
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
      workshop_agenda: 'module1',
      libraryError: false,
      libraryErrorMessage: null
    };
  }

  componentDidMount() {
    this.props.populateCodeMirror();
  }

  componentDidUpdate(prevProps, prevState) {
    // call preview form if we got new form questions or we have switched
    // on live preview.
    if (
      prevProps.formQuestions !== this.props.formQuestions ||
      (prevState.livePreviewStatus === PREVIEW_OFF &&
        this.state.livePreviewStatus === PREVIEW_ON)
    ) {
      this.previewFoorm();
    }
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
    if (this.state.livePreviewStatus === PREVIEW_ON) {
      // fill in form with any library items
      $.ajax({
        url: '/api/v1/pd/foorm/form_with_library_items',
        type: 'post',
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify({
          form_questions: this.props.formQuestions
        })
      })
        .done(result => {
          this.setState({
            formKey: this.state.formKey + 1,
            formPreviewQuestions: result,
            libraryError: false,
            libraryErrorMessage: null
          });
        })
        .fail(result => {
          console.log(result);
          this.setState({
            libraryError: true,
            libraryErrorMessage: result.responseJSON.error
          });
        });
    }
  };

  livePreviewToggled = toggleValue => {
    this.setState({livePreviewStatus: toggleValue});
  };

  render() {
    return (
      <div style={styles.foormEditor}>
        <div style={styles.editorAndOptions}>
          <div style={styles.editor} className="foorm-editor">
            {this.props.formName && (
              <div style={styles.editorHeader}>
                <h3>{`${this.props.formName}, version ${
                  this.props.formVersion
                }`}</h3>
                <h3>{`Form State: ${
                  this.props.isFormPublished ? 'Published' : 'Draft'
                }`}</h3>
              </div>
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
          </div>
          <div style={styles.options} className="foorm-options">
            {!this.props.formHasError && !this.state.libraryError && (
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
                    num_facilitators
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
                      onChange={e =>
                        this.setState({is_virtual: e.target.value})
                      }
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
                <ToggleGroup
                  onChange={this.livePreviewToggled}
                  selected={this.state.livePreviewStatus}
                >
                  <button type="button" value={PREVIEW_ON}>
                    Live Preview On
                  </button>
                  <button type="button" value={PREVIEW_OFF}>
                    Live Preview Off
                  </button>
                </ToggleGroup>
              </div>
            )}
          </div>
        </div>
        <div style={styles.preview} className="foorm-preview">
          <h3>Preview</h3>
          <div style={styles.previewBox}>
            {this.props.formHasError && (
              <div style={styles.errorMessage}>
                <FontAwesome icon="exclamation-triangle" /> There is a parsing
                error in the survey configuration. Errors are noted on the left
                side of the editor.
              </div>
            )}
            {this.state.libraryError && (
              <div style={styles.errorMessage}>
                <FontAwesome icon="exclamation-triangle" />
                {`There is an error in the use of at least one library question. The error is: ${
                  this.state.libraryErrorMessage
                }`}
              </div>
            )}
            {this.state.formPreviewQuestions &&
              !this.props.formHasError &&
              !this.state.libraryError && (
                // key allows us to force re-render when preview is called
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
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    formQuestions: state.foorm.formQuestions || {},
    isFormPublished: state.foorm.isFormPublished,
    formHasError: state.foorm.hasError
  }),
  dispatch => ({})
)(FoormEditor);
