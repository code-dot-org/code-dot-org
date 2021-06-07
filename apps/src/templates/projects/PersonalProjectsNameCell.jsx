import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {tableLayoutStyles} from '../tables/tableConstants';
import {updateProjectName} from './projectsRedux';

class PersonalProjectsNameCell extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    projectType: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
    isEditing: PropTypes.bool,
    updatedName: PropTypes.string,
    updateProjectName: PropTypes.func.isRequired
  };

  onChangeName = e => {
    this.props.updateProjectName(this.props.projectId, e.target.value);
  };

  render() {
    const {
      projectId,
      projectType,
      projectName,
      updatedName,
      isEditing
    } = this.props;
    const url = `/projects/${projectType}/${projectId}/edit`;

    return (
      <div>
        {!isEditing && (
          <a
            style={tableLayoutStyles.link}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-projects-table-project-name"
          >
            {projectName}
          </a>
        )}
        {isEditing && (
          <div>
            <input
              required
              style={styles.inputBox}
              value={updatedName}
              onChange={this.onChangeName}
              className="ui-project-rename-input"
            />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  inputBox: {
    width: 225
  }
};

export default connect(
  state => ({}),
  dispatch => ({
    updateProjectName(projectId, updatedName) {
      dispatch(updateProjectName(projectId, updatedName));
    }
  })
)(PersonalProjectsNameCell);
