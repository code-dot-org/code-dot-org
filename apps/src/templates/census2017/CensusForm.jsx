import React, {Component} from 'react';
import Button from '../Button';
import i18n from "@cdo/locale";
import _ from 'lodash';
import $ from 'jquery';
import {howManyStudents, roleOptions, courseTopics, frequencyOptions, pledge} from './censusQuestions';
import SchoolAutocompleteDropdownWithLabel from './SchoolAutocompleteDropdownWithLabel';
import CountryAutocompleteDropdown from '../CountryAutocompleteDropdown';
import SchoolNotFound from '../SchoolNotFound';
import { styles } from './censusFormStyles';

class CensusForm extends Component {

  state = {
    showFollowUp: false,
    showPledge: false,
    selectedHowMuchCS: [],
    selectedTopics: [],
    otherTopicsDesc: '',
    submission: {
      name: '',
      email: '',
      role: '',
      country: 'United States',
      hoc: '',
      nces: '',
      schoolName: '',
      schoolCity: '',
      schoolState: '',
      schoolZip: '',
      schoolType: '',
      afterSchool: '',
      tenHours: '',
      twentyHours: '',
      otherCS: false,
      followUpFrequency: '',
      followUpMore: '',
      acceptedPledge: false,
      share: ''
    },
    errors: {
      invalidEmail: false
    }
  };

  handleChange = (field, event) => {
    this.setState({
      submission: {
        ...this.state.submission,
        [field]: event.target.value
      }
    }, this.checkShowFollowUp);
  }

  handleDropdownChange = (field, event) => {
    this.setState({
      submission: {
        ...this.state.submission,
        [field]: event ? event.value : ''
      }
    });
  }

  checkShowFollowUp() {
    const twentyHours = this.state.submission.twentyHours;
    this.setState({
      showFollowUp: (twentyHours === 'SOME' || twentyHours === 'ALL')
    }, this.checkShowPledge);
  }

  checkShowPledge() {
    const role = this.state.submission.role;
    this.setState({
      showPledge: (role === 'TEACHER' || role === 'ADMINISTRATOR')
    });
  }

  togglePledge() {
    this.setState({
      submission: {
        ...this.state.submission,
        acceptedPledge: !this.state.submission.acceptedPledge
      }
    });
  }

  toggleOtherCS() {
    this.setState({
      submission: {
        ...this.state.submission,
        otherCS: !this.state.submission.otherCS
      }
    });
  }

  toggleTopics(option) {
    if (this.state.selectedTopics.includes(option)) {
      this.clearOption(option);
    } else {
      this.selectOption(option);
    }
  }

  selectOption(option) {
    this.setState({
      selectedTopics: this.state.selectedTopics.concat(option)
    });
  }

  clearOption(option) {
    this.setState({
      selectedTopics: _.without(this.state.selectedTopics, option)
    });
  }

  updateOtherTopicsDesc(event) {
    const description = event.target.value;
    const emptyDescription = ("" === description);

    // Clear the "other topics" checkbox when there is no description.
    if (emptyDescription) {
      this.clearOption("topic_other_b");
    }
    // Mark the "other topics" checkbox when there is a description.
    if (!emptyDescription) {
      this.selectOption("topic_other_b");
    }

    this.setState({ otherTopicsDesc: description });
  }

  processResponse() {
    window.location.href = "/yourschool/thankyou";
  }

  // The response in the error case is JSON with an entry for
  // each submitted field that is problematic. The specifics of
  // the problem are not important here since we just need a boolean value
  // of whether there was an error or not.
  processError(error) {
    const errorMap = {
      submitter_email_address: 'invalidEmail',
      class_frequency: 'frequency',
      nces_school_s: 'nces',
      submitter_role: 'role',
      how_many_do_hoc: 'hoc',
      how_many_after_school: 'afterSchool',
      how_many_10_hours: 'tenHours',
      how_many_20_hours: 'twentyHours',
      country: 'country',
      school_type: 'school',
      state: 'school',
      zip: 'school',
      school_name: 'school'
    };

    const errorJSON = error.responseJSON;
    Object.keys(errorJSON).map((key) =>  {
      const errorKey = errorMap[key];
      let newErrors = this.state.errors;
      newErrors[errorKey] = true;
      this.setState({
        errors: newErrors
      });
    });
  }

  validateSchoolDropdown() {
    if (this.state.submission.country === "United States") {
      if (this.state.submission.nces) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  validateSchool() {
    const {submission} = this.state;
    if (submission.country === "United States" && submission.nces === "-1") {
      return (this.validateNotBlank(submission.schoolName) || this.validateNotBlank(submission.schoolState) || this.validateNotBlank(submission.schoolCity)
      || this.validateNotBlank(submission.schoolType) || this.validateNotBlank(submission.schoolZip));
    } else {
      return false;
    }
  }

  validateNotBlank(questionField) {
    return questionField === '';
  }

  validateTopics() {
    return this.state.showFollowUp && this.state.selectedTopics.length === 0;
  }

  validateFrequency() {
    return this.state.showFollowUp && this.state.submission.followUpFrequency === '';
  }

  validateSubmission() {
    this.setState({
      errors: {
        ...this.state.errors,
        email: this.validateNotBlank(this.state.submission.email),
        topics: this.validateTopics(),
        frequency: this.validateFrequency(),
        country: this.validateNotBlank(this.state.submission.country),
        nces: this.validateSchoolDropdown(),
        school: this.validateSchool(),
        role: this.validateNotBlank(this.state.submission.role),
        hoc: this.validateNotBlank(this.state.submission.hoc),
        afterSchool: this.validateNotBlank(this.state.submission.afterSchool),
        tenHours: this.validateNotBlank(this.state.submission.tenHours),
        twentyHours: this.validateNotBlank(this.state.submission.twentyHours),
        share: this.validateNotBlank(this.state.submission.share)
      }
    }, this.censusFormSubmit);
  }

  censusFormSubmit() {
    const { errors } = this.state;
    if (!errors.email &&
        !errors.topics &&
        !errors.frequency &&
        !errors.school &&
        !errors.nces &&
        !errors.role &&
        !errors.hoc &&
        !errors.afterSchool &&
        !errors.tenHours &&
        !errors.twentyHours &&
        !errors.country &&
        !errors.share) {
      $.ajax({
        url: "/dashboardapi/v1/census/CensusYourSchool2017v5",
        type: "post",
        dataType: "json",
        data: $('#census-form').serialize()
      }).done(this.processResponse).fail(this.processError.bind(this));
      event.preventDefault();
    }
  }

  topicCheckbox(name, label) {
    return (
    <label>
      <input
        type="checkbox"
        name={name}
        checked={this.state.selectedTopics.includes(name)}
        onChange={() => this.toggleTopics(name)}
      />
      <span style={styles.checkboxOption}>
        {label}
      </span>
    </label>
    );
  }

  render() {
    const { showFollowUp, showPledge, submission, errors } = this.state;
    const showErrorMsg = !!(errors.email ||
                            errors.topics ||
                            errors.frequency ||
                            errors.school ||
                            errors.role ||
                            errors.hoc ||
                            errors.afterSchool ||
                            errors.tenHours ||
                            errors.twentyHours ||
                            errors.country ||
                            errors.nces ||
                            errors.share);
    const US = submission.country === "United States";

    return (
      <div id="form">
        <h2 style={styles.formHeading}>
          {i18n.yourSchoolTellUs()}
        </h2>
        <form id="census-form">
        <input type="hidden" id="school_year" name="school_year" value="2017"/>
          <CountryAutocompleteDropdown
            onChange={this.handleDropdownChange.bind("country")}
            value={submission.country}
            showRequiredIndicator
            showErrorMsg={errors.country}
          />
          {US && (
            <SchoolAutocompleteDropdownWithLabel
              setField={this.handleDropdownChange}
              value={submission.nces}
              showErrorMsg={errors.nces}
            />
          )}
          {US && this.state.submission.nces === "-1" && (
            <SchoolNotFound
              onChange={this.handleChange}
              schoolName={submission.schoolName}
              schoolType={submission.schoolType}
              schoolCity={submission.schoolCity}
              schoolState={submission.schoolState}
              schoolZip={submission.schoolZip}
              showErrorMsg={errors.school}
            />
          )}
          {!US && (
            <div>
              <label>
                <div style={styles.question}>
                  {i18n.schoolName()}
                  <span style={styles.asterisk}> *</span>
                </div>
                <input
                  type="text"
                  name="school_name_s"
                  value={this.state.schoolName}
                  onChange={this.handleChange.bind(this, 'schoolName')}
                  style={styles.input}
                />
              </label>
            </div>
          )}
          <div style={styles.question}>
            How much <span style={{fontWeight: 'bold'}}> coding/computer programming </span> is taught at this school? (assume for the purposes of this question that this does not include HTML/CSS, Web design, or how to use apps)
            <span style={styles.asterisk}> *</span>
          </div>
          <div style={styles.firstQuestion}>
            <label style={styles.dropdownBox}>
              <div style={styles.option}>
                {i18n.censusHowManyHoC()}
                {errors.hoc && (
                  <div style={styles.errors}>
                    {i18n.censusRequiredSelect()}
                  </div>
                )}
              </div>
              <select
                name="how_many_do_hoc"
                value={this.state.submission.hoc}
                onChange={this.handleChange.bind(this, 'hoc')}
                style={styles.dropdown}
              >
                {howManyStudents.map((role, index) =>
                  <option
                    value={role.value}
                    key={index}
                  >
                    {role.display}
                  </option>
                )}
              </select>
            </label>
          </div>
          <div style={styles.grayQuestion}>
            <label style={styles.dropdownBox}>
              <div style={styles.option}>
                {i18n.censusHowManyAfterSchool()}
                {errors.afterSchool && (
                  <div style={styles.errors}>
                    {i18n.censusRequiredSelect()}
                  </div>
                )}
              </div>
              <select
                name="how_many_after_school"
                value={this.state.submission.afterSchool}
                onChange={this.handleChange.bind(this, 'afterSchool')}
                style={styles.dropdown}
              >
                {howManyStudents.map((role, index) =>
                  <option
                    value={role.value}
                    key={index}
                  >
                    {role.display}
                  </option>
                )}
              </select>
            </label>
          </div>
          <div style={{padding: 15}}>
            <label style={styles.dropdownBox}>
              <div style={styles.option}>
                {i18n.censusHowManyTenHours()}
                {errors.tenHours && (
                  <div style={styles.errors}>
                    {i18n.censusRequiredSelect()}
                  </div>
                )}
              </div>
              <select
                name="how_many_10_hours"
                value={this.state.submission.tenHours}
                onChange={this.handleChange.bind(this, 'tenHours')}
                style={styles.dropdown}
              >
                {howManyStudents.map((role, index) =>
                  <option
                    value={role.value}
                    key={index}
                  >
                    {role.display}
                  </option>
                )}
              </select>
            </label>
          </div>
          <div style={styles.grayQuestion}>
            <label style={styles.dropdownBox}>
              <div style={styles.option}>
                {i18n.censusHowManyTwentyHours()}
                {errors.twentyHours && (
                  <div style={styles.errors}>
                    {i18n.censusRequiredSelect()}
                  </div>
                )}
              </div>
              <select
                name="how_many_20_hours"
                value={this.state.submission.twentyHours}
                onChange={this.handleChange.bind(this, 'twentyHours')}
                style={styles.dropdown}
              >
                {howManyStudents.map((role, index) =>
                  <option
                    value={role.value}
                    key={index}
                  >
                    {role.display}
                  </option>
                )}
              </select>
            </label>
          </div>
          <div style={{marginTop: 20, marginLeft: 38}}>
            <label>
              <input
                type="checkbox"
                name="other_classes_under_20_hours"
                checked={submission.otherCS}
                onChange={() => this.toggleOtherCS()}
              />
              <span style={styles.otherCS}>
                {i18n.censusOtherCourse()}
              </span>
            </label>
          </div>
          {showFollowUp && (
            <div>
              <div style={styles.question}>
                {i18n.censusFollowUp()}
                <span style={styles.asterisk}> *</span>
              </div>
              {errors.topics && (
                <div style={styles.errors}>
                  {i18n.censusRequiredSelect()}
                </div>
              )}
              <div style={styles.options}>
                {courseTopics.map((courseTopic, index) =>
                  <div
                    key={index}
                    style={styles.leftMargin}
                  >
                    {this.topicCheckbox(courseTopic.name, courseTopic.label)}
                  </div>
                )}
                <div style={styles.leftMargin}>
                  {this.topicCheckbox("topic_other_b", `${i18n.censusOtherDescribeHere()}`)}
                  &nbsp;
                  <input
                    type="text"
                    name="topic_other_description"
                    value={this.state.otherTopicsDesc}
                    onChange={this.updateOtherTopicsDesc.bind(this)}
                    style={styles.inputInline}
                  />
                </div>
                <div style={styles.leftMargin}>
                  {this.topicCheckbox("topic_do_not_know", i18n.iDontKnow())}
                </div>
              </div>
              <label>
                <div style={styles.question}>
                  {i18n.censusFollowUpFrequency()}
                  <span style={styles.asterisk}> *</span>
                </div>
                {errors.frequency && (
                  <div style={styles.errors}>
                    {i18n.censusRequiredSelect()}
                  </div>
                )}
                <select
                  name="class_frequency"
                  value={this.state.submission.followUpFrequency}
                  onChange={this.handleChange.bind(this, 'followUpFrequency')}
                  style={styles.wideDropdown}
                >
                  {frequencyOptions.map((role, index) =>
                    <option
                      value={role.value}
                      key={index}
                    >
                      {role.display}
                    </option>
                  )}
                </select>
              </label>
              <label>
                <div style={styles.question}>
                  {i18n.censusFollowUpTellUsMore()}
                </div>
                <textarea
                  type="text"
                  name="tell_us_more"
                  value={this.state.submission.followUpMore}
                  onChange={this.handleChange.bind(this, 'followUpMore')}
                  style={styles.textArea}
                />
              </label>
            </div>
          )}
          <label>
            <div style={styles.question}>
              {i18n.censusConnection()}
              <span style={styles.asterisk}> *</span>
            </div>
            {errors.role && (
              <div style={styles.errors}>
                {i18n.censusRequiredSelect()}
              </div>
            )}
            <select
              name="submitter_role"
              value={this.state.submission.role}
              onChange={this.handleChange.bind(this, 'role')}
              style={styles.wideDropdown}
            >
              {roleOptions.map((role, index) =>
                <option
                  value={role.value}
                  key={index}
                >
                  {role.display}
                </option>
              )}
            </select>
          </label>
          <div>
            <label>
              <div style={styles.question}>
                {i18n.censusEmail()}
                <span style={styles.asterisk}> *</span>
              </div>
              {errors.email && (
                <div style={styles.errors}>
                  {i18n.censusRequiredEmail()}
                </div>
              )}
              {errors.invalidEmail && (
                <div style={styles.errors}>
                  {i18n.censusInvalidEmail()}
                </div>
              )}
              <input
                type="text"
                name="submitter_email_address"
                value={this.state.submission.email}
                onChange={this.handleChange.bind(this, 'email')}
                placeholder={i18n.yourEmailPlaceholder()}
                style={styles.input}
              />
            </label>
            <label>
              {errors.share && (
                 <div style={styles.errors}>
                   {i18n.censusRequiredShare()}
                 </div>
              )}
              <span style={styles.share}>
                Share my contact information with the Code.org <a href="educate/regional-partner">regional partner</a> in my state so I can be contacted about local professional learning, resources and events.
              </span>
              <select
                name="share_with_regional_partners"
                value={this.state.submission.share}
                onChange={this.handleChange.bind(this, 'share')}
                style={styles.dropdown}
              >
                <option value="" disabled>{i18n.yesNo()}</option>
                <option value="true">{i18n.yes()}</option>
                <option value="false">{i18n.no()}</option>
              </select>
              <span style={styles.asterisk}> *</span>
            </label>
          </div>
          <div>
            <label>
              <div style={styles.question}>
                {i18n.yourName()}
              </div>
              <input
                type="text"
                name="submitter_name"
                value={this.state.submission.name}
                onChange={this.handleChange.bind(this, 'name')}
                placeholder={i18n.yourName()}
                style={styles.input}
              />
            </label>
          </div>
          {showPledge && (
            <div style={styles.pledgeBox}>
              <label>
                <input
                  type="checkbox"
                  name="pledged"
                  checked={submission.acceptedPledge}
                  onChange={() => this.togglePledge()}
                />
                <span style={styles.pledge}>
                  {pledge}
                </span>
              </label>
            </div>
          )}
          {showErrorMsg && (
            <div style={styles.errors}>
              {i18n.censusRequired()}
            </div>
          )}
          <Button
            id="submit-button"
            onClick={() => this.validateSubmission()}
            color={Button.ButtonColor.orange}
            text={i18n.submit()}
            size={Button.ButtonSize.large}
            style={{marginTop: '10px'}}
          />
        </form>
      </div>
    );
  }
}

export const UnconnectedCensusForm = CensusForm;
