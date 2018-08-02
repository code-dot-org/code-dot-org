import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {tableLayoutStyles} from "../tables/tableConstants";
import {startRenamingProject} from './projectsRedux';

const styles = {
  inputBox: {
    width: 225,
  },
};

class PersonalProjectsNameCell extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    projectType: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
    isEditing: PropTypes.bool,
    updatedName: PropTypes.string,
    startRenamingProject: PropTypes.func.isRequired,
  };
   onChangeName = (e) => {
    this.props.startRenamingProject(this.props.projectId, e.target.value);
  };
  render() {
    const {projectId, projectType, projectName, updatedName, isEditing} = this.props;
    const url = `/projects/${projectType}/${projectId}/`;
    return (
      <div>
        {!isEditing &&
          <a style={tableLayoutStyles.link} href={url} target="_blank">{projectName}</a>
        }
        {isEditing &&
          <div>
            <input
              required
              style={styles.inputBox}
              value={updatedName}
              onChange={this.onChangeName}
              placeholder={projectName}
            />
          </div>
        }
      </div>
    );
  }
}

 export default connect(state => ({}), dispatch => ({
  startRenamingProject(projectId, updatedName) {
    dispatch(startRenamingProject(projectId, updatedName));
  },
}))(PersonalProjectsNameCell);
