import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

import CountryAutocompleteDropdown from '../CountryAutocompleteDropdown';
import SchoolNotFound from '../SchoolNotFound';

import {styles} from './censusFormStyles';
import {
  howManyStudents,
  roleOptions,
  courseTopics,
  frequencyOptions,
  pledge,
} from './censusQuestions';
import SchoolAutocompleteDropdownWithLabel from './SchoolAutocompleteDropdownWithLabel';

export const censusFormPrefillDataShape = PropTypes.shape({
  userName: PropTypes.string,
  userEmail: PropTypes.string,
  isTeacher: PropTypes.bool,
  schoolCountry: PropTypes.string,
  schoolId: PropTypes.string,
  schoolType: PropTypes.string,
  schoolName: PropTypes.string,
  schoolState: PropTypes.string,
  schoolZip: PropTypes.string,
});

const CensusForm = ({
  onSchoolDropdownChange,
  schoolDropdownOption,
  initialSchoolYear,
  prefillData = {},
}) => {
  const [state, setState] = useState({
    showFollowUp: false,
    showPledge: false,
    selectedHowMuchCS: [],
    selectedTopics: [],
    otherTopicsDesc: '',
    schoolName: prefillData.schoolName ?? '',
    schoolYear: initialSchoolYear,
    submission: {
      name: prefillData.userName ?? '',
      email: prefillData.userEmail ?? '',
      role: prefillData.isTeacher ? 'TEACHER' : '',
      country: prefillData.schoolCountry ?? 'United States',
      hoc: '',
      schoolName: prefillData.schoolName ?? '',
      schoolCity: '',
      schoolState: prefillData.schoolState ?? '',
      schoolZip: prefillData.schoolZip ?? '',
      schoolType: prefillData.schoolType ?? '',
      afterSchool: '',
      tenHours: '',
      twentyHours: '',
      otherCS: false,
      followUpFrequency: '',
      followUpMore: '',
      acceptedPledge: false,
      share: '',
      optIn: '',
    },
    errors: {
      invalidEmail: false,
    },
  });

  const handleChange = (field, event) => {
    setState(
      {
        submission: {
          ...state.submission,
          [field]: event.target.value,
        },
      },
      checkShowFollowUp
    );
  };

  const handleSchoolDropdownChange = (field, event) => {
    onSchoolDropdownChange(event);
  };

  const handleDropdownChange = (field, event) => {
    setState({
      submission: {
        ...state.submission,
        [field]: event ? event.value : '',
      },
    });
  };

  const checkShowFollowUp = () => {
    const twentyHours = state.submission.twentyHours;
    setState(
      {
        showFollowUp: twentyHours === 'SOME' || twentyHours === 'ALL',
      },
      checkShowPledge
    );
  };

  const checkShowPledge = () => {
    const role = state.submission.role;
    setState({
      showPledge: role === 'TEACHER' || role === 'ADMINISTRATOR',
    });
  };

  const togglePledge = () => {
    setState({
      submission: {
        ...state.submission,
        acceptedPledge: !state.submission.acceptedPledge,
      },
    });
  };

  const toggleOtherCS = () => {
    setState({
      submission: {
        ...state.submission,
        otherCS: !state.submission.otherCS,
      },
    });
  };

  const toggleTopics = option => {
    if (state.selectedTopics.includes(option)) {
      clearOption(option);
    } else {
      selectOption(option);
    }
  };

  const selectOption = option => {
    setState({
      selectedTopics: state.selectedTopics.concat(option),
    });
  };

  const clearOption = option => {
    setState({
      selectedTopics: _.without(state.selectedTopics, option),
    });
  };

  const updateOtherTopicsDesc = event => {
    const description = event.target.value;
    const emptyDescription = '' === description;

    // Clear the "other topics" checkbox when there is no description.
    if (emptyDescription) {
      clearOption('topic_other_b');
    }
    // Mark the "other topics" checkbox when there is a description.
    if (!emptyDescription) {
      selectOption('topic_other_b');
    }

    setState({otherTopicsDesc: description});
  };

  const processResponse = () => {
    window.location.href = '/yourschool/thankyou';
  };

  // The response in the error case is JSON with an entry for
  // each submitted field that is problematic. The specifics of
  // the problem are not important here since we just need a boolean value
  // of whether there was an error or not.
  const processError = error => {
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
      school_name: 'school',
    };

    const errorJSON = error.responseJSON;
    Object.keys(errorJSON).map(key => {
      const errorKey = errorMap[key];
      let newErrors = state.errors;
      newErrors[errorKey] = true;
      setState({
        errors: newErrors,
      });
    });
  };

  const getSchoolId = () => {
    if (schoolDropdownOption) {
      return schoolDropdownOption.value;
    } else if (prefillData && prefillData['schoolId']) {
      return prefillData['schoolId'];
    } else {
      return '';
    }
  };

  const validateSchoolDropdown = () => {
    if (state.submission.country === 'United States') {
      if (getSchoolId()) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  const validateSchool = () => {
    const {submission} = state;
    if (submission.country === 'United States' && getSchoolId() === '-1') {
      return (
        validateNotBlank(submission.schoolName) ||
        validateNotBlank(submission.schoolState) ||
        validateNotBlank(submission.schoolCity) ||
        validateNotBlank(submission.schoolType) ||
        validateNotBlank(submission.schoolZip)
      );
    } else {
      return false;
    }
  };

  const validateNotBlank = questionField => {
    return questionField === '';
  };

  const validateTopics = () => {
    return state.showFollowUp && state.selectedTopics.length === 0;
  };

  const validateFrequency = () => {
    return state.showFollowUp && state.submission.followUpFrequency === '';
  };

  const validateSubmission = () => {
    setState(
      {
        errors: {
          ...state.errors,
          email: validateNotBlank(state.submission.email),
          topics: validateTopics(),
          frequency: validateFrequency(),
          country: validateNotBlank(state.submission.country),
          nces: validateSchoolDropdown(),
          school: validateSchool(),
          role: validateNotBlank(state.submission.role),
          hoc: validateNotBlank(state.submission.hoc),
          afterSchool: validateNotBlank(state.submission.afterSchool),
          tenHours: validateNotBlank(state.submission.tenHours),
          twentyHours: validateNotBlank(state.submission.twentyHours),
          share: validateNotBlank(state.submission.share),
          optIn: validateNotBlank(state.submission.optIn),
        },
      },
      censusFormSubmit
    );
  };

  const censusFormSubmit = () => {
    const {errors} = state;
    if (
      !errors.email &&
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
      !errors.share &&
      !errors.optIn
    ) {
      $.ajax({
        url: '/dashboardapi/v1/census/CensusYourSchool2017v7',
        type: 'post',
        dataType: 'json',
        data: $('#census-form').serialize(),
      })
        .done(processResponse)
        .fail(processError.bind(this));
      event.preventDefault();
    }
  };

  const topicCheckbox = (name, label) => {
    return (
      <label>
        <input
          type="checkbox"
          name={name}
          checked={state.selectedTopics.includes(name)}
          onChange={() => toggleTopics(name)}
        />
        <span style={styles.checkboxOption}>{label}</span>
      </label>
    );
  };

  const {showFollowUp, showPledge, submission, errors} = state;
  const showErrorMsg = !!(
    errors.email ||
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
    errors.share ||
    errors.optIn
  );
  const US = submission.country === 'United States';
  let schoolId = prefillData['schoolId'] || '';
  if (schoolDropdownOption) {
    schoolId = undefined;
  }
  const showSchoolNotFound =
    US &&
    (schoolId === '-1' ||
      (schoolDropdownOption && schoolDropdownOption.value === '-1'));

  return (
    <div id="form">
      <h2 style={styles.formHeading}>{i18n.yourSchoolTellUs()}</h2>
      <form id="census-form">
        <CountryAutocompleteDropdown
          onChange={handleDropdownChange.bind('country')}
          value={submission.country}
          showRequiredIndicator
          showErrorMsg={errors.country}
        />
        {US && (
          <SchoolAutocompleteDropdownWithLabel
            setField={handleSchoolDropdownChange}
            value={schoolId}
            schoolDropdownOption={schoolDropdownOption}
            showErrorMsg={errors.nces}
          />
        )}
        {showSchoolNotFound && (
          <SchoolNotFound
            onChange={handleChange}
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
                value={submission.schoolName}
                onChange={handleChange.bind(this, 'schoolName')}
                style={styles.input}
              />
            </label>
          </div>
        )}
        <div style={styles.question}>
          Please answer the questions below about the {initialSchoolYear}-
          {initialSchoolYear + 1} school year.
        </div>
        <div style={styles.question}>
          How much{' '}
          <span style={{fontWeight: 'bold'}}>
            {' '}
            coding/computer programming{' '}
          </span>{' '}
          is taught at this school? (assume for the purposes of this question
          that this does not include HTML/CSS, Web design, or how to use apps)
          <span style={styles.asterisk}> *</span>
        </div>
        <div style={styles.firstQuestion}>
          <label style={styles.dropdownBox}>
            <div style={styles.option}>
              {i18n.censusHowManyHoC()}
              {errors.hoc && (
                <div style={styles.errors}>{i18n.censusRequiredSelect()}</div>
              )}
            </div>
            <select
              name="how_many_do_hoc"
              value={state.submission.hoc}
              onChange={handleChange.bind(this, 'hoc')}
              style={styles.dropdown}
            >
              {howManyStudents.map((role, index) => (
                <option value={role.value} key={index}>
                  {role.display}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={styles.grayQuestion}>
          <label style={styles.dropdownBox}>
            <div style={styles.option}>
              {i18n.censusHowManyAfterSchool()}
              {errors.afterSchool && (
                <div style={styles.errors}>{i18n.censusRequiredSelect()}</div>
              )}
            </div>
            <select
              name="how_many_after_school"
              value={state.submission.afterSchool}
              onChange={handleChange.bind(this, 'afterSchool')}
              style={styles.dropdown}
            >
              {howManyStudents.map((role, index) => (
                <option value={role.value} key={index}>
                  {role.display}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={{padding: 15}}>
          <label style={styles.dropdownBox}>
            <div style={styles.option}>
              {i18n.censusHowManyTenHours()}
              {errors.tenHours && (
                <div style={styles.errors}>{i18n.censusRequiredSelect()}</div>
              )}
            </div>
            <select
              name="how_many_10_hours"
              value={state.submission.tenHours}
              onChange={handleChange.bind(this, 'tenHours')}
              style={styles.dropdown}
            >
              {howManyStudents.map((role, index) => (
                <option value={role.value} key={index}>
                  {role.display}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={styles.grayQuestion}>
          <label style={styles.dropdownBox}>
            <div style={styles.option}>
              {i18n.censusHowManyTwentyHours()}
              {errors.twentyHours && (
                <div style={styles.errors}>{i18n.censusRequiredSelect()}</div>
              )}
            </div>
            <select
              name="how_many_20_hours"
              value={state.submission.twentyHours}
              onChange={handleChange.bind(this, 'twentyHours')}
              style={styles.dropdown}
            >
              {howManyStudents.map((role, index) => (
                <option value={role.value} key={index}>
                  {role.display}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div style={styles.checkboxLine}>
          <label style={styles.clickable}>
            <input
              type="checkbox"
              name="other_classes_under_20_hours"
              checked={submission.otherCS}
              onChange={() => toggleOtherCS()}
            />
            <span style={styles.otherCS}>{i18n.censusOtherCourse()}</span>
          </label>
        </div>

        {showFollowUp && (
          <div>
            <div style={styles.question}>
              {i18n.censusFollowUp()}
              <span style={styles.asterisk}> *</span>
            </div>
            {errors.topics && (
              <div style={styles.errors}>{i18n.censusRequiredSelect()}</div>
            )}
            <div style={styles.options}>
              {courseTopics.map((courseTopic, index) => (
                <div key={index} style={styles.leftMargin}>
                  {topicCheckbox(courseTopic.name, courseTopic.label)}
                </div>
              ))}
              <div style={styles.leftMargin}>
                {topicCheckbox(
                  'topic_other_b',
                  `${i18n.censusOtherDescribeHere()}`
                )}
                &nbsp;
                <input
                  type="text"
                  name="topic_other_description"
                  value={state.otherTopicsDesc}
                  onChange={updateOtherTopicsDesc.bind(this)}
                  style={styles.inputInline}
                />
              </div>
              <div style={styles.leftMargin}>
                {topicCheckbox('topic_do_not_know', i18n.iDontKnow())}
              </div>
            </div>
            <label>
              <div style={styles.question}>
                {i18n.censusFollowUpFrequency()}
                <span style={styles.asterisk}> *</span>
              </div>
              {errors.frequency && (
                <div style={styles.errors}>{i18n.censusRequiredSelect()}</div>
              )}
              <select
                name="class_frequency"
                value={state.submission.followUpFrequency}
                onChange={handleChange.bind(this, 'followUpFrequency')}
                style={styles.wideDropdown}
              >
                {frequencyOptions.map((role, index) => (
                  <option value={role.value} key={index}>
                    {role.display}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <div style={styles.question}>
                {i18n.censusFollowUpTellUsMore()}
              </div>
              <textarea
                type="text"
                name="tell_us_more"
                value={state.submission.followUpMore}
                onChange={handleChange.bind(this, 'followUpMore')}
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
            <div style={styles.errors}>{i18n.censusRequiredSelect()}</div>
          )}
          <select
            name="submitter_role"
            value={state.submission.role}
            onChange={handleChange.bind(this, 'role')}
            style={styles.wideDropdown}
          >
            {roleOptions.map((role, index) => (
              <option value={role.value} key={index}>
                {role.display}
              </option>
            ))}
          </select>
        </label>
        <div>
          <label>
            <div style={styles.question}>
              {i18n.censusEmail()}
              <span style={styles.asterisk}> *</span>
            </div>
            {errors.email && (
              <div style={styles.errors}>{i18n.censusRequiredEmail()}</div>
            )}
            {errors.invalidEmail && (
              <div style={styles.errors}>{i18n.censusInvalidEmail()}</div>
            )}
            <input
              type="text"
              name="submitter_email_address"
              value={state.submission.email}
              onChange={handleChange.bind(this, 'email')}
              placeholder={i18n.yourEmailPlaceholder()}
              style={styles.input}
            />
          </label>
          <label>
            {errors.share && (
              <div style={styles.errors}>{i18n.censusRequiredShare()}</div>
            )}
            <span style={styles.share}>
              Share my contact information with the Code.org{' '}
              <a href="educate/regional-partner">regional partner</a> in my
              state so I can be contacted about local professional learning,
              resources and events.
            </span>
            <select
              name="share_with_regional_partners"
              value={state.submission.share}
              onChange={handleChange.bind(this, 'share')}
              style={styles.dropdown}
            >
              <option value="" disabled>
                {i18n.yesNo()}
              </option>
              <option value="true">{i18n.yes()}</option>
              <option value="false">{i18n.no()}</option>
            </select>
            <span style={styles.asterisk}> *</span>
          </label>
        </div>

        <div>
          {errors.optIn && (
            <div style={styles.errors}>
              Required. Please let us know if we can email you.
            </div>
          )}
          <span style={styles.share}>
            Can we email you about updates to our courses, local opportunities,
            or other computer science news? &nbsp;
            <a href="/privacy" target="_blank">
              (See our privacy policy)
            </a>
          </span>

          <select
            name="opt_in"
            value={state.submission.optIn}
            onChange={handleChange.bind(this, 'optIn')}
            style={styles.dropdown}
          >
            <option value="" disabled>
              {i18n.yesNo()}
            </option>
            <option value="true">{i18n.yes()}</option>
            <option value="false">{i18n.no()}</option>
          </select>
          <span style={styles.asterisk}> *</span>
        </div>

        <div>
          <label>
            <div style={styles.question}>{i18n.yourName()}</div>
            <input
              type="text"
              name="submitter_name"
              value={state.submission.name}
              onChange={handleChange.bind(this, 'name')}
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
                onChange={() => togglePledge()}
              />
              <span style={styles.pledge}>{pledge}</span>
            </label>
          </div>
        )}

        {showErrorMsg && (
          <div style={styles.errors}>{i18n.censusRequired()}</div>
        )}
        <Button
          id="submit-button"
          onClick={() => validateSubmission()}
          color={Button.ButtonColor.brandSecondaryDefault}
          text={i18n.submit()}
          size={Button.ButtonSize.large}
          style={{marginTop: '10px'}}
        />
      </form>
    </div>
  );
};

CensusForm.propTypes = {
  prefillData: censusFormPrefillDataShape,
  initialSchoolYear: PropTypes.number,
  schoolDropdownOption: PropTypes.object,
  onSchoolDropdownChange: PropTypes.func,
};

export const UnconnectedCensusForm = CensusForm;
