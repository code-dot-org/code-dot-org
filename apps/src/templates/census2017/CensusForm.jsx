import React, {Component} from 'react';
// import ReactDOM from 'react-dom';
// import Button from '../Button';
import i18n from "@cdo/locale";
// import {styles} from './censusFormSTyles';
// import _ from 'lodash';
// import $ from 'jquery';
import {howManyStudents} from './censusQuestions';
import Input from './Input';
import Dropdown from './Dropdown';
// import ProtectedStatefulDiv from '../../templates/ProtectedStatefulDiv';

class CensusForm extends Component {

  state = {
    formData: {
      name: '',
      email: '',
      hoc: '',
      afterSchool: '',
      tenHours: '',
      twentyHours: '',
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
    const CSCourseTypes = [{
        name: "hoc_s",
        field: "hoc",
        label: i18n.censusHowManyHoC(),
        value: this.state.formData.hoc,
      },
      {
        name: "after_school_s",
        field: "afterSchool",
        label: i18n.censusHowManyAfterSchool(),
        value: this.state.formData.afterSchool,
      },
      {
        name: "ten_hours_s",
        field: "tenHours",
        label: i18n.censusHowManyTenHours(),
        value: this.state.formData.tenHours,
      },
      {
        name: "twenty_hours_s",
        field: "twentyHours",
        label: i18n.censusHowManyTwentyHours(),
        value: this.state.formData.twentyHours
      }
    ];

    return (
      <div>
        {CSCourseTypes.map((CSCourseType, index) =>
          <div key={index}>
            <Dropdown
              field={CSCourseType.field}
              label={CSCourseType.label}
              name={CSCourseType.name}
              value={CSCourseType.value}
              dropdownOptions={howManyStudents}
              setField={this.handleChange}
            />
          </div>
        )}
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
