// Interface for admins to try out Foorm configurations in real-time.
// Includes a json editor with a starting configuration, along with
// a preview button to preview the configuration in Foorm

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Tabs, Tab} from 'react-bootstrap';
import color from '@cdo/apps/util/color';
import _ from 'lodash';
import FoormSaveBar from './FoormSaveBar';
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
  },
  warning: {
    color: color.red,
    fontWeight: 'bold'
  }
};

const PREVIEW_ON = 'preview-on';
const PREVIEW_OFF = 'preview-off';

class FoormEditor extends React.Component {
  static propTypes = {
    populateCodeMirror: PropTypes.func.isRequired,
    formName: PropTypes.string,
    formVersion: PropTypes.number,
    formId: PropTypes.number,
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

  // use debounce to only call once per second
  fillFormWithLibraryItems = _.debounce(
    function() {
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
          this.setState({
            libraryError: true,
            libraryErrorMessage: result.responseJSON.error
          });
        });
    },
    1000,
    {leading: true}
  );

  previewFoorm = () => {
    if (this.state.livePreviewStatus === PREVIEW_ON) {
      this.fillFormWithLibraryItems();
    }
  };

  livePreviewToggled = toggleValue => {
    this.setState({livePreviewStatus: toggleValue});
  };

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
          formName={this.props.formName}
          formVersion={this.props.formVersion}
          livePreviewToggled={this.livePreviewToggled}
          livePreviewStatus={this.state.livePreviewStatus}
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
                  value={JSON.stringify(this.props.formQuestions, null, 2)}
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
                libraryError={this.state.libraryError}
                libraryErrorMessage={this.state.libraryErrorMessage}
                formPreviewQuestions={this.state.formPreviewQuestions}
                formKey={this.state.formKey}
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
        {/* For now, only allow save of existing forms. */}
        {this.props.formName && <FoormSaveBar formId={this.props.formId} />}
      </div>
    );
  }
}

export default connect(state => ({
  formQuestions: state.foorm.formQuestions || {},
  isFormPublished: state.foorm.isFormPublished,
  formHasError: state.foorm.hasError
}))(FoormEditor);
