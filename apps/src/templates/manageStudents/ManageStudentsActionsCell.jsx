import React, {Component, PropTypes} from 'react';
import QuickActionsCell from "../tables/QuickActionsCell";
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import Button from '../Button';
import {startEditingStudent, cancelEditingStudent} from './manageStudentsRedux';
import {connect} from 'react-redux';

const styles = {
  xIcon: {
    paddingRight: 5,
  }
};

class ManageStudentActionsCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    isEditing: PropTypes.bool,
    // Provided by redux
    startEditingStudent: PropTypes.func,
    cancelEditingStudent: PropTypes.func,
  };

  onEdit = () => {
    this.props.startEditingStudent(this.props.id);
  };

  onCancel = () => {
    this.props.cancelEditingStudent(this.props.id);
  };

  render() {
    return (
      <div>
        {!this.props.isEditing &&
          <QuickActionsCell>
            <PopUpMenu.Item
              onClick={this.onEdit}
            >
              Edit
            </PopUpMenu.Item>
            <MenuBreak/>
            <PopUpMenu.Item
              onClick={()=>{}}
              color={color.red}
            >
              <FontAwesome icon="times-circle" style={styles.xIcon}/>
              Remove student
            </PopUpMenu.Item>
          </QuickActionsCell>
        }
        {this.props.isEditing &&
          <div>
            <Button onClick={() => {}} color={Button.ButtonColor.white} text="Save" />
            <Button onClick={this.onCancel} color={Button.ButtonColor.blue} text="Cancel" />
          </div>
        }
      </div>
    );
  }
}

export default connect(state => ({}), dispatch => ({
  startEditingStudent(id) {
    dispatch(startEditingStudent(id));
  },
  cancelEditingStudent(id) {
    dispatch(cancelEditingStudent(id));
  },
}))(ManageStudentActionsCell);
