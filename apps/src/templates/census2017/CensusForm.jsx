import React, {Component} from 'react';
// import ReactDOM from 'react-dom';
// import Button from '../Button';
import color from "../../util/color";
// import i18n from "@cdo/locale";
// import _ from 'lodash';
// import $ from 'jquery';
// import {CSOptions, roleOptions, courseTopics, frequencyOptions, pledge} from './censusQuestions';
import NameInput from './NameInput';
// import ProtectedStatefulDiv from '../../templates/ProtectedStatefulDiv';

export const styles = {
  formHeading: {
    marginTop: 20
  },
  question: {
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.charcoal,
    paddingTop: 10,
    paddingBottom: 5
  },
  pledgeBox: {
    marginBottom: 20,
    marginTop: 20
  },
  pledge: {
    fontSize: 18,
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.charcoal,
    paddingBottom: 10,
    paddingTop: 10,
    marginLeft: 18,
  },
  option: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    marginLeft: 18
  },
  dropdown: {
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
  },
  options: {
    marginLeft: 35
  },
  input: {
    height: 40,
    width: 250,
    fontFamily: '"Gotham 3r", sans-serif',
    padding: 5
  },
  textArea: {
    height: 100,
    width: '100%',
    fontFamily: '"Gotham 3r", sans-serif',
    padding: 5
  },
  errors: {
    fontSize: 14,
    fontFamily: '"Gotham 3r", sans-serif',
    color: color.red,
    paddingTop: 5,
    paddingBottom: 5
  },
  asterisk: {
    fontSize: 20,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.red,
  },
};

class CensusForm extends Component {

  state = {
    showFollowUp: false,
    selectedHowMuchCS: [],
    selectedTopics: [],
    submission: {
      name: '',
      email: '',
      role: '',
      followUpFrequency: '',
      followUpMore: '',
      acceptedPledge: false
    },
    errors: {
      invalidEmail: false
    }
  };

  nameChange = (dataFromChild) => {
     this.setState({
       submission: {
         ...this.state.submission,
         name: dataFromChild
       }
     });
   }

  render() {
    return (
      <div>
        <NameInput
          name={this.state.submission.name}
          nameCallback={this.nameChange}
        />
      </div>
    );
  }
}

export const UnconnectedCensusForm = CensusForm;
