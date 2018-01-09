import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";

const GENDERS = {
  m: i18n.genderMale(),
  f: i18n.genderFemale()
};

class ManageStudentGenderCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    gender: PropTypes.string,
    isEditing: PropTypes.bool,
  };

  state = {
    genderValue: this.props.gender
  };

  onChangeGender = (e) => {
    this.setState({genderValue: e.target.value});
  }

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

export default ManageStudentGenderCell;
