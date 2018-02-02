import React, {Component, PropTypes} from 'react';
import {ages} from '../AgeDropdown';
import {connect} from 'react-redux';
import {editAge} from './manageStudentsRedux';

class ManageStudentAgeCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    age: PropTypes.number,
    isEditing: PropTypes.bool,
    // Provided by redux
    editAge: PropTypes.func.isRequired,
  };

  state = {
    ageValue: this.props.age
  };

  onChangeAge = (e) => {
    const newAge = e.target.value;
    this.setState({ageValue: newAge});
    this.props.editAge(this.props.id, newAge);
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
  editAge(id, age) {
    dispatch(editAge(id, age));
  },
}))(ManageStudentAgeCell);
