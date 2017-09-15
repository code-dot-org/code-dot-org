import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import {styles} from './CensusForm';

class NameInput extends Component {

  static propTypes = {
    setName: PropTypes.func,
    name: PropTypes.string
  }

  sendToForm = (event) => {
    this.props.setName(event.target.value);
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
           value={this.props.name}
           onChange={this.sendToForm}
           placeholder={i18n.yourName()}
           style={styles.input}
         />
       </label>
     </div>
    );
  }
}

export default NameInput;
