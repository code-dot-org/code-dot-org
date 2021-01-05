// Main page for Foorm Editor interface. Will initially show a choice
// between loading an existing configuration or an empty configuration.
// After that choice is made, will render FoormEditor with the chosen configuration.

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, DropdownButton, MenuItem} from 'react-bootstrap';
import FoormEditor from './FoormEditor';
import {
  resetAvailableForms,
  setLastSaved,
  setSaveError,
  setFormData,
  setHasError,
  setLastSavedQuestions
} from './editor/foormEditorRedux';

const styles = {
  loadError: {
    fontWeight: 'bold',
    padding: '1em'
  }
};

class FoormEditorManager extends React.Component {
  static propTypes = {
    populateCodeMirror: PropTypes.func,
    resetCodeMirror: PropTypes.func,
    formNamesAndVersions: PropTypes.array,
    formCategories: PropTypes.array,

    // populated by redux
    formQuestions: PropTypes.object,
    availableForms: PropTypes.array,
    resetAvailableForms: PropTypes.func,
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setFormData: PropTypes.func,
    setHasError: PropTypes.func,
    setLastSavedQuestions: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      formKey: 0,
      formPreviewQuestions: null,
      showCodeMirror: false,
      hasLoadError: false
    };

    this.props.resetAvailableForms(this.props.formNamesAndVersions);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.formNamesAndVersions !== this.props.formNamesAndVersions) {
      this.props.resetAvailableForms(this.props.formNamesAndVersions);
    }
  }

  getFormattedConfigurationDropdownOptions() {
    return this.props.availableForms.map((formNameAndVersion, i) => {
      const formName = formNameAndVersion['name'];
      const formVersion = formNameAndVersion['version'];
      const formId = formNameAndVersion['id'];
      return (
        <MenuItem
          key={i}
          eventKey={i}
          onClick={() => this.loadConfiguration(formId)}
        >
          {`${formName}, version ${formVersion}`}
        </MenuItem>
      );
    });
  }

  loadConfiguration(formId) {
    this.props.setLastSaved(null);
    this.props.setSaveError(null);
    $.ajax({
      url: `/api/v1/pd/foorm/form/${formId}`,
      type: 'get'
    })
      .done(result => {
        this.updateFormData(result);
        this.setState({
          showCodeMirror: true,
          hasLoadError: false
        });
      })
      .fail(() => {
        this.updateFormData({
          questions: {},
          published: null,
          formName: null,
          formVersion: null,
          formId: null
        });
        this.setState({
          showCodeMirror: true,
          hasLoadError: true
        });
      });
  }

  initializeEmptyCodeMirror = () => {
    this.props.setLastSaved(null);
    this.props.setSaveError(null);
    this.updateFormData({
      questions: {},
      published: null,
      formName: null,
      formVersion: null,
      formId: null
    });
    this.setState({
      showCodeMirror: true,
      hasLoadError: false
    });
  };

  updateFormData = formData => {
    this.props.setFormData(formData);
    this.props.setHasError(false);
    this.props.setLastSavedQuestions(formData['questions']);
    this.props.resetCodeMirror(formData['questions']);
  };

  render() {
    return (
      <div>
        <h1>Foorm Editor</h1>
        <p>
          Interface for creating and making updates to Foorm forms. Check out
          our{' '}
          <a
            href="https://github.com/code-dot-org/code-dot-org/wiki/%5BLevelbuilder%5D-The-Foorm-Editor"
            target="_blank"
            rel="noopener noreferrer"
          >
            How To
          </a>{' '}
          to get started.
        </p>
        <div>
          <DropdownButton id="load_config" title="Load Form..." className="btn">
            {this.getFormattedConfigurationDropdownOptions()}
          </DropdownButton>
          <Button onClick={this.initializeEmptyCodeMirror} className="btn">
            New Form
          </Button>
        </div>
        {this.state.hasLoadError && (
          <div style={styles.loadError}>Could not load the selected form.</div>
        )}
        {this.state.showCodeMirror && (
          <FoormEditor
            populateCodeMirror={this.props.populateCodeMirror}
            formCategories={this.props.formCategories}
            resetCodeMirror={this.props.resetCodeMirror}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    formQuestions: state.foorm.formQuestions || {},
    availableForms: state.foorm.availableForms || []
  }),
  dispatch => ({
    resetAvailableForms: formMetadata =>
      dispatch(resetAvailableForms(formMetadata)),
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setFormData: formData => dispatch(setFormData(formData)),
    setHasError: hasError => dispatch(setHasError(hasError)),
    setLastSavedQuestions: formQuestions =>
      dispatch(setLastSavedQuestions(formQuestions))
  })
)(FoormEditorManager);
