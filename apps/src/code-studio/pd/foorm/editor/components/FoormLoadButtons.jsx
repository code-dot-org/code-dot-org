// Main page for Foorm Editor interface. Will initially show a choice
// between loading an existing configuration or an empty configuration.
// After that choice is made, will render FoormEditor with the chosen configuration.

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, DropdownButton, MenuItem} from 'react-bootstrap';
import {
  resetAvailableOptions,
  setLastSaved,
  setSaveError,
  setFormData,
  setHasJSONError,
  setLastSavedQuestions
} from '../foormEditorRedux';

const styles = {
  loadError: {
    fontWeight: 'bold',
    padding: '1em'
  }
};

class FoormLoadButtons extends React.Component {
  static propTypes = {
    resetCodeMirror: PropTypes.func,
    namesAndVersions: PropTypes.array,
    setShowCodeMirror: PropTypes.func,

    // populated by redux
    hasJSONError: PropTypes.bool,
    availableForms: PropTypes.array,
    questions: PropTypes.object,
    resetAvailableForms: PropTypes.func,
    setLastSaved: PropTypes.func,
    setSaveError: PropTypes.func,
    setFormData: PropTypes.func,
    setHasJSONError: PropTypes.func,
    setLastSavedFormQuestions: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      hasLoadError: false
    };

    this.props.resetAvailableForms(this.props.namesAndVersions);
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
      url: `/api/v1/pd/foorm/forms/${formId}`,
      type: 'get'
    })
      .done(result => {
        this.updateFormData(result);
        this.props.setShowCodeMirror(true);
        this.setState({
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
    this.props.setHasJSONError(false);
    this.props.setLastSavedFormQuestions(formData['questions']);
    this.props.resetCodeMirror(formData['questions']);
  };

  render() {
    return (
      <div>
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
      </div>
    );
  }
}

export default connect(
  state => ({
    questions: state.foorm.questions || {},
    availableForms: state.foorm.availableOptions || [],
    hasJSONError: state.foorm.hasJSONError
  }),
  dispatch => ({
    resetAvailableForms: formsMetadata =>
      dispatch(resetAvailableOptions(formsMetadata)),
    setLastSaved: lastSaved => dispatch(setLastSaved(lastSaved)),
    setSaveError: saveError => dispatch(setSaveError(saveError)),
    setFormData: formData => dispatch(setFormData(formData)),
    setHasJSONError: hasJSONError => dispatch(setHasJSONError(hasJSONError)),
    setLastSavedFormQuestions: formQuestions =>
      dispatch(setLastSavedQuestions(formQuestions))
  })
)(FoormLoadButtons);
