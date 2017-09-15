import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import {styles} from './CensusForm';

class NameInput extends Component {

  static propTypes = {
    setName: PropTypes.func,
    name: PropTypes.string
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
           onChange={this.props.setName(event.target.value)}
           placeholder={i18n.yourName()}
           style={styles.input}
         />
       </label>
     </div>
    );
  }
}

export default NameInput;
