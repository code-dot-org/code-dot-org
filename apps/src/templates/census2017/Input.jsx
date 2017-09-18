import React, {Component, PropTypes} from 'react';
import {styles} from './censusFormStyles';

class Input extends Component {

  static propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    setField: PropTypes.func,
    required: PropTypes.bool
  }

  sendToForm = (event) => {
    this.props.setField(this.props.field, event);
  }

  render() {
    const { label, name, placeholder, value, required } = this.props;
    return (
     <div>
       <label>
         <div style={styles.question}>
          {label}
          {required && (
            <span style={styles.asterisk}> *</span>
          )}
         </div>
         <input
           type="text"
           name={name}
           value={value}
           onChange={this.sendToForm}
           placeholder={placeholder}
           style={styles.input}
         />
       </label>
     </div>
    );
  }
}

export default Input;
