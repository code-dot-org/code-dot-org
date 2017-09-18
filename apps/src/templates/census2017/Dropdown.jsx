import React, {Component, PropTypes} from 'react';
import {styles} from './censusFormStyles';

class Dropdown extends Component  {

  static propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    dropdownOptions: PropTypes.array.isRequired,
    setField: PropTypes.func,
    required: PropTypes.bool
  }

  sendToForm = (event) => {
    this.props.setField(this.props.field, event);
  }

  render() {
    const { label, name, value, dropdownOptions, required } = this.props;
    return (
      <div>
       <label style={styles.dropdownBox}>
         <div style={styles.option}>
           {label}
           {required && (
             <span style={styles.asterisk}> *</span>
           )}
         </div>
         <select
           name={name}
           value={value}
           onChange={this.sendToForm}
           style={styles.dropdown}
         >
           {dropdownOptions.map((option, index) =>
             <option
               value={option}
               key={index}
             >
               {option}
             </option>
           )}
         </select>
       </label>
     </div>
    );
  }
}

export default Dropdown;
