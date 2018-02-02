import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {tableLayoutStyles} from "../tables/tableConstants";
import i18n from "@cdo/locale";
import {editStudent} from './manageStudentsRedux';

class ManageStudentNameCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    sectionId: PropTypes.number,
    name: PropTypes.string.isRequired,
    loginType: PropTypes.string.isRequired,
    username: PropTypes.string,
    isEditing: PropTypes.bool,
    //Provided by redux
    editStudent: PropTypes.func.isRequired,
  };

  state = {
    nameValue: this.props.name
  };

  onChangeName = (e) => {
    const newName = e.target.value;
    this.setState({nameValue: newName});
    this.props.editStudent(this.props.id, {name: newName});
  };

  render() {
    const {id, sectionId, name, loginType, username} = this.props;
    return (
      <div>
        {!this.props.isEditing &&
          <div>
            <a
              style={tableLayoutStyles.link}
              href={`/teacher-dashboard#/sections/${sectionId}/student/${id}`}
              target="_blank"
            >
              {name}
            </a>
            {loginType === SectionLoginType.email &&
              <p>{i18n.usernameLabel() + username}</p>
            }
          </div>
        }
        {this.props.isEditing &&
          <input value={this.state.nameValue} onChange={this.onChangeName}/>
        }
      </div>
      );
  }
}

export default connect(state => ({}), dispatch => ({
  editStudent(id, studentInfo) {
    dispatch(editStudent(id, studentInfo));
  },
}))(ManageStudentNameCell);
