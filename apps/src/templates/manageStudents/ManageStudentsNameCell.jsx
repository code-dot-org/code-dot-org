import React, {Component, PropTypes} from 'react';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';
import {tableLayoutStyles} from "../tables/tableConstants";
import i18n from "@cdo/locale";

class ManageStudentNameCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    sectionId: PropTypes.number,
    name: PropTypes.string.isRequired,
    loginType: PropTypes.string.isRequired,
    username: PropTypes.string,
    isEditing: PropTypes.bool,
  };

  state = {
    nameValue: this.props.name
  };

  onChangeName = (e) => {
    this.setState({nameValue: e.target.value});
  }

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

export default ManageStudentNameCell;
