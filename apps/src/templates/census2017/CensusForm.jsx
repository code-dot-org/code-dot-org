import React, {Component} from 'react';
// import ReactDOM from 'react-dom';
// import Button from '../Button';
import i18n from "@cdo/locale";
// import {styles} from './censusFormSTyles';
// import _ from 'lodash';
// import $ from 'jquery';
// import {CSOptions, roleOptions, courseTopics, frequencyOptions, pledge} from './censusQuestions';
import Input from './Input';
// import ProtectedStatefulDiv from '../../templates/ProtectedStatefulDiv';

class CensusForm extends Component {

  state = {
    formData: {
      name: '',
      email: ''
    },
  };

  handleChange = (field, event) => {
  this.setState({
    formData: {
      ...this.state.formData,
      [field]: event.target.value
    }
  });
}

  render() {
    return (
      <div>
        <Input
          field="name"
          label={i18n.yourName()}
          name="name_s"
          placeholder={i18n.yourName()}
          value={this.state.formData.name}
          setField={this.handleChange}
        />
        <Input
          field="email"
          label={i18n.yourEmail()}
          name="email_S"
          placeholder={i18n.yourEmailPlaceholder()}
          value={this.state.formData.email}
          setField={this.handleChange}
        />
      </div>
    );
  }
}

export const UnconnectedCensusForm = CensusForm;
