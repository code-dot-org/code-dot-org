/* globals dashboard */

import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';

import ProjectUpdatedAt from './ProjectUpdatedAt';
import {refreshProjectName} from '../../headerRedux';

const styles = {
  buttonWrapper: {
    float: 'left'
  }
};

class UnconnectedDisplayProjectName extends React.Component {
  static propTypes = {
    beginEdit: PropTypes.func.isRequired,
    projectName: PropTypes.string.isRequired
  };

  render() {
    return (
      <div style={styles.buttonWrapper}>
        <div className="project_name_wrapper header_text">
          <div className="project_name header_text">
            {this.props.projectName}
          </div>
          <ProjectUpdatedAt />
        </div>
        <div
          className="project_edit header_button header_button_light"
          onClick={this.props.beginEdit}
        >
          {i18n.rename()}
        </div>
      </div>
    );
  }
}
const DisplayProjectName = connect(state => ({
  projectName: state.header.projectName
}))(UnconnectedDisplayProjectName);

class UnconnectedEditProjectName extends React.Component {
  static propTypes = {
    finishEdit: PropTypes.func.isRequired,
    projectName: PropTypes.string.isRequired,
    refreshProjectName: PropTypes.func.isRequired
  };

  state = {
    savingName: false
  };

  saveNameChange = () => {
    if (this.state.savingName) {
      return;
    }

    const newName = this.nameChangeInput.value.trim().substr(0, 100);
    if (newName.length === 0) {
      return;
    }

    dashboard.project.rename(newName, () => {
      dashboard.header.updateTimestamp();
      this.props.refreshProjectName();
      this.setState({
        savingName: false
      });
      this.props.finishEdit();
    });

    this.setState({
      savingName: true
    });
  };

  render() {
    // Use an uncontrolled input for the "rename" operation so our UI tests
    // can easily interface with it
    return (
      <div style={styles.buttonWrapper}>
        <div className="project_name_wrapper header_text">
          <input
            type="text"
            className="project_name header_input"
            maxLength="100"
            defaultValue={this.props.projectName}
            ref={input => {
              this.nameChangeInput = input;
            }}
          />
        </div>
        <div
          className="project_save header_button header_button_light"
          onClick={this.saveNameChange}
          disabled={this.state.savingName}
        >
          {i18n.save()}
        </div>
      </div>
    );
  }
}
const EditProjectName = connect(
  state => ({
    projectName: state.header.projectName
  }),
  {
    refreshProjectName
  }
)(UnconnectedEditProjectName);

export default class EditableProjectName extends React.Component {
  state = {
    editName: false
  };

  beginEdit = () => {
    this.setState({
      editName: true
    });
  };

  finishEdit = () => {
    this.setState({
      editName: false
    });
  };

  render() {
    if (this.state.editName) {
      return <EditProjectName finishEdit={this.finishEdit} />;
    } else {
      return <DisplayProjectName beginEdit={this.beginEdit} />;
    }
  }
}
