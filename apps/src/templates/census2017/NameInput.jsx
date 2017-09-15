import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import {styles} from './CensusForm';

class NameInput extends Component {

  static propTypes = {
    nameCallback: PropTypes.func
  }

  state = {
    name: ''
  };

  handleChange(propertyName, event) {
    this.setState({
      [propertyName]: event.target.value
    },
    this.passToForm);
  }

  passToForm = () => {
    this.props.nameCallback(this.state.name);
   }

  render() {
   return (
     <div>
       <label>
         <div style={styles.question}>
           {i18n.yourName()}
         </div>
         <input
           type="text"
           name="name_s"
           value={this.state.name}
           onChange={this.handleChange.bind(this, 'name')}
           placeholder={i18n.yourName()}
           style={styles.input}
         />
       </label>
     </div>
   );
  }
}

export default NameInput;
