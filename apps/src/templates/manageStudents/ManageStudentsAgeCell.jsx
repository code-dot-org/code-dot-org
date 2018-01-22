import React, {Component, PropTypes} from 'react';
import {ages} from '../AgeDropdown';

class ManageStudentAgeCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    age: PropTypes.number,
    isEditing: PropTypes.bool,
  };

  state = {
    ageValue: this.props.age
  };

  onChangeAge = (e) => {
    this.setState({ageValue: e.target.value});
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

export default ManageStudentAgeCell;
