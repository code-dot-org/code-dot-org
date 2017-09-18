import React, {Component} from 'react';
import ReactDOM from 'react-dom';
// import Button from '../Button';
import i18n from "@cdo/locale";
import {styles} from './censusFormStyles';
// import _ from 'lodash';
// import $ from 'jquery';
import {howManyStudents, roleOptions} from './censusQuestions';
import Input from './Input';
import Dropdown from './Dropdown';
import Checkbox from './Checkbox';
import ProtectedStatefulDiv from '../../templates/ProtectedStatefulDiv';

class CensusForm extends Component {

  state = {
    formData: {
      name: '',
      email: '',
      hoc: '',
      afterSchool: '',
      tenHours: '',
      twentyHours: '',
      role: '',
      pledge: false
    },
  };

  componentDidMount() {
   // Move the haml-rendered DOM section inside our protected stateful div
    $('#school-info').appendTo(ReactDOM.findDOMNode(this.refs.schoolInfo)).show();
  }

  handleChange = (field, event) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [field]: event.target.value
      }
    });
  }

  toggle = (field) => {
    this.setState({
     formData: {
       ...this.state.formData,
       [field]: !this.state.formData[field]
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
        <h2 style={styles.formHeading}>
          {i18n.yourSchoolTellUs()}
        </h2>
        <form id="census-form">
          <ProtectedStatefulDiv
            ref="schoolInfo"
          />
          <div style={styles.question}>
            {i18n.censusHowMuch()}
            <span style={styles.asterisk}> *</span>
          </div>
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
          <Dropdown
            field="role"
            label={i18n.censusConnection()}
            name="role_s"
            value={this.state.formData.role}
            dropdownOptions={roleOptions}
            setField={this.handleChange}
            required={true}
          />
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
            name="email_s"
            placeholder={i18n.yourEmailPlaceholder()}
            value={this.state.formData.email}
            setField={this.handleChange}
            required={true}
          />
          <Checkbox
            field="pledge"
            label={i18n.censusPledge()}
            name="pledge_b"
            checked={this.state.formData.pledge}
            setField={this.toggle}
          />
        </form>
      </div>
    );
  }
}

export const UnconnectedCensusForm = CensusForm;
