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
    editedValue: PropTypes.string,
    //Provided by redux
    editStudent: PropTypes.func.isRequired,
  };

  onChangeName = (e) => {
    this.props.editStudent(this.props.id, {name: e.target.value});
  };

  render() {
    const {id, sectionId, name, loginType, username, editedValue} = this.props;
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
          <div style={{paddingTop: 10}}>
            <input value={editedValue} onChange={this.onChangeName}/>
            <div style={{color: 'red', fontSize: 9, height: 10}}>{this.props.editedValue.length === 0 ? 'required' : ''}</div>
          </div>
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
