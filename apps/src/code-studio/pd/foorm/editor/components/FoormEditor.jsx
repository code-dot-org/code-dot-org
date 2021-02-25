// Interface for admins to try out Foorm configurations in real-time.
// Includes a json editor with a starting configuration, along with
// a preview button to preview the configuration in Foorm

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Tabs, Tab} from 'react-bootstrap';
import FormSaveBar from '../form/FormSaveBar';
import FoormEditorPreview from './FoormEditorPreview';
import FoormEditorHeader from './FoormEditorHeader';

const facilitator_names = ['Alice', 'Bob', 'Carly', 'Dave'];

const styles = {
  foormEditor: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10
  },
  editor: {
    minWidth: 560,
    width: '48%',
    marginRight: 12
  },
  options: {
    minWidth: 215,
    marginLeft: 5
  },
  preview: {
    width: '48%',
    marginRight: 12
  }
};

const PREVIEW_ON = 'preview-on';
const PREVIEW_OFF = 'preview-off';

class FoormEditor extends React.Component {
  static propTypes = {
    populateCodeMirror: PropTypes.func.isRequired,
    resetCodeMirror: PropTypes.func.isRequired,
    categories: PropTypes.array,
    preparePreview: PropTypes.func,
    previewQuestions: PropTypes.object,
    previewErrors: PropTypes.array,
    forceRerenderKey: PropTypes.number,
    renderHeaderTitle: PropTypes.func,

    // populated by redux
<<<<<<< HEAD:apps/src/code-studio/pd/foorm/editor/components/FoormEditor.jsx
    questions: PropTypes.object
=======
    questions: PropTypes.object,
    isFormPublished: PropTypes.bool,
    formName: PropTypes.string,
    formVersion: PropTypes.number,
    formId: PropTypes.number
    // name: PropTypes.string,
    // version: PropTypes.number,
    // isPublished: PropTypes.bool
>>>>>>> Rename hasError to hasJSONError:apps/src/code-studio/pd/foorm/FoormEditor.jsx
  };

  constructor(props) {
    super(props);

    this.state = {
      livePreviewStatus: PREVIEW_ON,
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
    this.previewFoorm();
  }

  componentDidUpdate(prevProps, prevState) {
    // call preview if we got new questions or we have switched
    // on live preview.
    if (
      prevProps.questions !== this.props.questions ||
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
      this.props.preparePreview();
    }
  };

  livePreviewToggled = toggleValue => {
    this.setState({livePreviewStatus: toggleValue});
  };

<<<<<<< HEAD:apps/src/code-studio/pd/foorm/editor/components/FoormEditor.jsx
=======
  // // bind this instead of using arrow function?
  // // pass down from manager?
  // renderHeaderTitle() {
  //   return (
  //     <div>
  //       <h2 style={styles.surveyTitle}>
  //         {`Form Name: ${this.props.name}, version ${this.props.version}`}
  //       </h2>
  //       <h3 style={styles.surveyState}>
  //         {`Form State: ${this.props.isPublished ? 'Published' : 'Draft'}`}
  //       </h3>
  //     </div>
  //   );
  // }

>>>>>>> Rename hasError to hasJSONError:apps/src/code-studio/pd/foorm/FoormEditor.jsx
  renderVariables() {
    return (
      <div style={styles.options}>
        <div>
          <form>
            <label>
              workshop_course <br />
              <input
                type="text"
                value={this.state.workshop_course}
                onChange={e => this.setState({workshop_course: e.target.value})}
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
                onChange={e => this.setState({workshop_agenda: e.target.value})}
              />
            </label>
          </form>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <FoormEditorHeader
          livePreviewToggled={this.livePreviewToggled}
          livePreviewStatus={this.state.livePreviewStatus}
          validateURL={'/api/v1/pd/foorm/forms/validate_form'}
          validateDataKey={'form_questions'}
          renderHeaderTitle={this.props.renderHeaderTitle}
        />
        <div style={styles.foormEditor}>
          <Tabs
            style={styles.editor}
            defaultActiveKey="editor"
            id="editor-tabs"
          >
            <Tab eventKey={'editor'} title={'Editor'}>
              {/* textarea is filled by populateCodeMirror()*/}
              <div className="foorm-editor">
                <textarea
                  ref="content"
                  // 3rd parameter specifies number of spaces to insert
                  // into the output JSON string for readability purposes.
                  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
                  value={JSON.stringify(this.props.questions, null, 2)}
                  // Change handler is required for this element, but changes will be handled by the code mirror.
                  onChange={() => {}}
                />
              </div>
            </Tab>
            <Tab eventKey="variables" title="Variables">
              {this.renderVariables()}
            </Tab>
          </Tabs>
          <Tabs
            style={styles.preview}
            defaultActiveKey="preview"
            id="preview-tabs"
          >
            <Tab eventKey={'preview'} title={'Preview'}>
              <FoormEditorPreview
                previewQuestions={this.props.previewQuestions}
                forceRerenderKey={this.props.forceRerenderKey}
                errorMessages={this.props.previewErrors}
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
            </Tab>
          </Tabs>
        </div>
        <FormSaveBar
          formCategories={this.props.categories}
          resetCodeMirror={this.props.resetCodeMirror}
        />
      </div>
    );
  }
}

export default connect(state => ({
<<<<<<< HEAD:apps/src/code-studio/pd/foorm/editor/components/FoormEditor.jsx
=======
  formQuestions: state.foorm.formQuestions || {},
  isFormPublished: state.foorm.isFormPublished,
  formName: state.foorm.formName,
  formVersion: state.foorm.formVersion,
  formId: state.foorm.formId,
  // name: state.foorm.name,
  // version: state.foorm.version,
  // isPublished: state.foorm.isPublished,
>>>>>>> Rename hasError to hasJSONError:apps/src/code-studio/pd/foorm/FoormEditor.jsx
  questions: state.foorm.questions
}))(FoormEditor);
