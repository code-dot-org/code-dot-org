// Main page for Foorm Editor interface. Will initially show a choice
// between loading an existing configuration or an empty configuration.
// After that choice is made, will render FoormEditor with the chosen configuration.

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, DropdownButton, MenuItem} from 'react-bootstrap';
import FoormEditor from './FoormEditor';

const styles = {
  loadError: {
    fontWeight: 'bold',
    padding: '1em'
  }
};

class FoormEditorManager extends React.Component {
  static propTypes = {
    updateFormQuestions: PropTypes.func,
    populateCodeMirror: PropTypes.func,
    resetCodeMirror: PropTypes.func,
    formNamesAndVersions: PropTypes.array,

    // populated by redux
    formQuestions: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      formKey: 0,
      formPreviewQuestions: null,
      formattedConfigurationOptions: this.getFormattedConfigurationDropdownOptions(
        this.props.formNamesAndVersions
      ),
      showCodeMirror: false,
      formName: null,
      formVersion: null,
      hasLoadError: false
    };
  }

  getFormattedConfigurationDropdownOptions(formNamesAndVersions) {
    return formNamesAndVersions.map((formNameAndVersion, i) => {
      const formName = formNameAndVersion['name'];
      const formVersion = formNameAndVersion['version'];
      return (
        <MenuItem
          key={i}
          eventKey={i}
          onClick={() => this.loadConfiguration(formName, formVersion)}
        >
          {`${formName}, version ${formVersion}`}
        </MenuItem>
      );
    });
  }

  loadConfiguration(formName, formVersion) {
    $.ajax({
      url: '/api/v1/pd/foorm/form_questions',
      type: 'get',
      data: {name: formName, version: formVersion}
    })
      .done(result => {
        this.props.updateFormQuestions(result);
        this.setState({
          showCodeMirror: true,
          formName: formName,
          formVersion: formVersion,
          hasLoadError: false
        });
        this.props.resetCodeMirror(result);
      })
      .fail(() => {
        this.props.updateFormQuestions({});
        this.setState({
          showCodeMirror: true,
          formName: null,
          formVersion: null,
          hasLoadError: true
        });
        this.props.resetCodeMirror({});
      });
  }

  initializeEmptyCodeMirror = () => {
    this.setState({
      showCodeMirror: true,
      formName: null,
      formVersion: null,
      hasLoadError: false
    });
    this.props.resetCodeMirror({});
  };

  render() {
    return (
      <div>
        <div>
          <DropdownButton id="load_config" title="Load Survey...">
            {this.state.formattedConfigurationOptions}
          </DropdownButton>
          <Button onClick={this.initializeEmptyCodeMirror}>New Survey</Button>
        </div>
        {this.state.hasLoadError && (
          <div style={styles.loadError}>
            Could not load the selected survey.
          </div>
        )}
        {this.state.showCodeMirror && (
          <FoormEditor
            populateCodeMirror={this.props.populateCodeMirror}
            formName={this.state.formName}
            formVersion={this.state.formVersion}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => ({formQuestions: state.foorm.formQuestions || {}}),
  dispatch => ({})
)(FoormEditorManager);
