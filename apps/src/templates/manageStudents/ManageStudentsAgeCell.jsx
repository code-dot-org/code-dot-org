import React, {Component, PropTypes} from 'react';
import {ages} from '../AgeDropdown';
import {connect} from 'react-redux';
import {editStudent} from './manageStudentsRedux';

class ManageStudentAgeCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    age: PropTypes.number,
    isEditing: PropTypes.bool,
    // Provided by redux
    editStudent: PropTypes.func.isRequired,
  };

  state = {
    ageValue: this.props.age
  };

  onChangeAge = (e) => {
    const newAge = e.target.value;
    this.setState({ageValue: newAge});
    this.props.editStudent(this.props.id, {age: newAge});
  };

  render() {
    const {age} = this.props;
    return (
      <div>
        {!this.props.isEditing &&
          <div>
            {age}
          </div>
        }
        {this.props.isEditing &&
          <select
            name="age"
            value={this.state.ageValue}
            onChange={this.onChangeAge}
          >
           {ages.map(age => <option key={age} value={age}>{age}</option>)}
          </select>
        }
      </div>
    );
  }
}

export default connect(state => ({}), dispatch => ({
  editStudent(id, studentInfo) {
    dispatch(editStudent(id, studentInfo));
  },
}))(ManageStudentAgeCell);
