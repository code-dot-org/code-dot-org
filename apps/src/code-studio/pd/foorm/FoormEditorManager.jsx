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
    updateFormData: PropTypes.func,
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
      url: '/api/v1/pd/foorm/form_data',
      type: 'get',
      data: {name: formName, version: formVersion}
    })
      .done(result => {
        this.props.updateFormData(result);
        this.setState({
          showCodeMirror: true,
          formName: formName,
          formVersion: formVersion,
          hasLoadError: false
        });
        this.props.resetCodeMirror(result['questions']);
      })
      .fail(() => {
        this.props.updateFormData({questions: {}, published: null});
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
        <h1>Foorm Editor</h1>
        <p>
          Interface for creating and making updates to Foorm surveys. Check out
          our{' '}
          <a href="https://github.com/code-dot-org/code-dot-org/wiki/%5BLevelbuilder%5D-The-Foorm-Editor">
            How To
          </a>{' '}
          to get started.
        </p>
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
  state => ({
    formQuestions: state.foorm.formQuestions || {}
  }),
  dispatch => ({})
)(FoormEditorManager);
