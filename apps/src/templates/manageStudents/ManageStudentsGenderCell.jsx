import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import i18n from "@cdo/locale";
import {editGender} from './manageStudentsRedux';

const GENDERS = {
  m: i18n.genderMale(),
  f: i18n.genderFemale()
};

class ManageStudentGenderCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    gender: PropTypes.string,
    isEditing: PropTypes.bool,
    // Provided by redux
    editGender: PropTypes.func.isRequired,
  };

  state = {
    genderValue: this.props.gender
  };

  onChangeGender = (e) => {
    const newGender = e.target.value;
    this.setState({genderValue: newGender});
    this.props.editGender(this.props.id, newGender);
  };

  render() {
    return (
      <div>
        {!this.props.isEditing &&
          <div>
            {GENDERS[this.props.gender]}
          </div>
        }
        {this.props.isEditing &&
          <select
            ref={element => this.root = element}
            name="age"
            value={this.state.genderValue}
            onChange={this.onChangeGender}
          >
           {Object.keys(GENDERS).map(gender => <option key={gender} value={gender}>{GENDERS[gender]}</option>)}
          </select>
        }
      </div>
    );
  }
}

export default connect(state => ({}), dispatch => ({
  editGender(id, gender) {
    dispatch(editGender(id, gender));
  },
}))(ManageStudentGenderCell);
