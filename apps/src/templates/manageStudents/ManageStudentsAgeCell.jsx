import React, {Component, PropTypes} from 'react';

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
  }

  render() {
    const {age} = this.props;
    const ages = ['', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14',
      '15', '16', '17', '18', '19', '20', '21+'];
    return (
      <div>
        {!this.props.isEditing &&
          <div>
            {age}
          </div>
        }
        {this.props.isEditing &&
          <select
            ref={element => this.root = element}
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
