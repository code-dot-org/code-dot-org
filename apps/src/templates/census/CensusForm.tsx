import React, {ChangeEvent, CSSProperties, useMemo, useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

import CountryAutocompleteDropdown from '../CountryAutocompleteDropdown';
import SchoolNotFound from '../SchoolNotFound';

import {styles as formStyles} from './censusFormStyles';
import {
  howManyStudents,
  roleOptions,
  courseTopics,
  frequencyOptions,
  pledge,
} from './censusQuestions';
import SchoolAutocompleteDropdownWithLabel from './SchoolAutocompleteDropdownWithLabel';

const styles = formStyles as Record<string, CSSProperties>;

interface Option {
  value: string;
  label: string;
}

interface CensusFormProps {
  onSchoolDropdownChange: (arg: Option) => void;
  schoolDropdownOption?: Option;
  initialSchoolYear?: number;
  prefillData?: CensusFormPrefill;
}

interface CensusFormPrefill {
  userName?: string;
  userEmail?: string;
  isTeacher?: boolean;
  schoolCountry?: string;
  schoolId?: string;
  schoolType?: string;
  schoolName?: string;
  schoolState?: string;
  schoolZip?: string;
}

interface CensusFormState {
  showFollowUp: boolean;
  showPledge: boolean;
  selectedHowMuchCS: string[];
  selectedTopics: string[];
  otherTopicsDesc: string;
  schoolYear?: number;
}

interface CensusSubmission {
  name: string;
  email: string;
  role: string;
  country: string;
  hoc: string;
  schoolName: string;
  schoolCity: string;
  schoolState: string;
  schoolZip: string;
  schoolType: string;
  afterSchool: string;
  tenHours: string;
  twentyHours: string;
  otherCS: boolean;
  followUpFrequency: string;
  followUpMore: string;
  acceptedPledge: boolean;
  share: string;
  optIn: string;
}

export const CensusForm: React.FC<CensusFormProps> = ({
  onSchoolDropdownChange,
  schoolDropdownOption,
  initialSchoolYear,
  prefillData = {},
}) => {
  const [state, setState] = useState<CensusFormState>({
    showFollowUp: false,
    showPledge: false,
    selectedHowMuchCS: [],
    selectedTopics: [],
    otherTopicsDesc: '',
    schoolYear: initialSchoolYear,
  });
  const [submission, setSubmission] = useState<CensusSubmission>({
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
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({
    invalidEmail: false,
  });

  const showFollowUp = useMemo(
    () => submission.twentyHours === 'SOME' || submission.twentyHours === 'ALL',
    [submission.twentyHours]
  );

  const showPledge = useMemo(
    () => submission.role === 'TEACHER' || submission.role === 'ADMINISTRATOR',
    [submission.role]
  );

  const handleChange = (
    field: string,
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setSubmission(prevState => ({
      ...prevState,
      [field]: event.target.value,
    }));
  };

  const handleSchoolDropdownChange = (_: string, option: Option) => {
    onSchoolDropdownChange(option);
  };

  const handleDropdownChange = (field: string, option: Option) => {
    setSubmission(prevState => ({
      ...prevState,
      [field]: option ? option.value : '',
    }));
  };

  const togglePledge = () => {
    setSubmission(prevState => ({
      ...prevState,
      acceptedPledge: !prevState.acceptedPledge,
    }));
  };

  const toggleOtherCS = () => {
    setSubmission(prevState => ({
      ...prevState,
      otherCS: !prevState.otherCS,
    }));
  };

  const toggleTopics = (option: string) => {
    if (state.selectedTopics.includes(option)) {
      clearOption(option);
    } else {
      selectOption(option);
    }
  };

  const selectOption = (option: string) => {
    setState(prevState => ({
      ...prevState,
      selectedTopics: [...prevState.selectedTopics, option],
    }));
  };

  const clearOption = (option: string) => {
    setState(prevState => ({
      ...prevState,
      selectedTopics: prevState.selectedTopics.filter(opt => opt !== option),
    }));
  };

  const updateOtherTopicsDesc = (event: ChangeEvent<HTMLInputElement>) => {
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

    setState(prevState => ({...prevState, otherTopicsDesc: description}));
  };

  const processResponse = () => {
    window.location.href = '/yourschool/thankyou';
  };

  // The response in the error case is JSON with an entry for
  // each submitted field that is problematic. The specifics of
  // the problem are not important here since we just need a boolean value
  // of whether there was an error or not.
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
  const processError = (
    errorResponse: Record<keyof typeof errorMap, string>
  ) => {
    setErrors(prevState => {
      const updatedErrors = {...prevState};
      Object.keys(errorResponse).forEach(key => {
        const errorKey = errorMap[key as keyof typeof errorMap];
        updatedErrors[errorKey] = true;
      });
      return updatedErrors;
    });
  };

  const getSchoolId = () => {
    if (schoolDropdownOption) {
      return schoolDropdownOption.value;
    } else if (prefillData && prefillData.schoolId) {
      return prefillData.schoolId;
    } else {
      return '';
    }
  };

  const validateSchoolDropdown = () => {
    if (submission.country === 'United States') {
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

  const validateNotBlank = (questionField?: string) => questionField === '';

  const validateTopics = () =>
    showFollowUp && state.selectedTopics.length === 0;

  const validateFrequency = () =>
    showFollowUp && submission.followUpFrequency === '';

  const validateSubmission = (e: MouseEvent) => {
    e.preventDefault();
    const updatedErrors = {...errors};
    updatedErrors.email = validateNotBlank(submission.email);
    updatedErrors.topics = validateTopics();
    updatedErrors.frequency = validateFrequency();
    updatedErrors.country = validateNotBlank(submission.country);
    updatedErrors.nces = validateSchoolDropdown();
    updatedErrors.school = validateSchool();
    updatedErrors.role = validateNotBlank(submission.role);
    updatedErrors.hoc = validateNotBlank(submission.hoc);
    updatedErrors.afterSchool = validateNotBlank(submission.afterSchool);
    updatedErrors.tenHours = validateNotBlank(submission.tenHours);
    updatedErrors.twentyHours = validateNotBlank(submission.twentyHours);
    updatedErrors.share = validateNotBlank(submission.share);
    updatedErrors.optIn = validateNotBlank(submission.optIn);

    setErrors(updatedErrors);
    if (Object.values(updatedErrors).every(value => value === false)) {
      censusFormSubmit();
    }
  };

  const censusFormSubmit = async () => {
    const formData: Record<string, string> = Object.fromEntries(
      Object.entries({
        submitter_email_address: submission.email,
        submitter_name: submission.name,
        submitter_role: submission.role,
        how_many_do_hoc: submission.hoc,
        how_many_after_school: submission.afterSchool,
        how_many_10_hours: submission.tenHours,
        how_many_20_hours: submission.twentyHours,
        other_classes_under_20_hours: submission.otherCS,
        topic_blocks: state.selectedTopics.includes('topic_blocks'),
        topic_text: state.selectedTopics.includes('topic_text'),
        topic_robots: state.selectedTopics.includes('topic_robots'),
        topic_internet: state.selectedTopics.includes('topic_internet'),
        topic_security: state.selectedTopics.includes('topic_security'),
        topic_data: state.selectedTopics.includes('topic_data'),
        topic_web_design: state.selectedTopics.includes('topic_web_design'),
        topic_game_design: state.selectedTopics.includes('topic_game_design'),
        topic_ethical_social: state.selectedTopics.includes(
          'topic_ethical_social'
        ),
        topic_other: state.selectedTopics.includes('topic_other'),
        topic_other_description: state.otherTopicsDesc || undefined,
        topic_do_not_know: state.selectedTopics.includes('topic_do_not_know'),
        class_frequency: submission.followUpFrequency,
        tell_us_more: submission.followUpMore || undefined,
        pledged: submission.acceptedPledge,
        share_with_regional_partners: submission.share,
        country_s: submission.country,
        nces_school_s: schoolDropdownOption?.value,
        school_type_s: submission.schoolType,
        school_state_s: submission.schoolState,
        school_zip_s: submission.schoolZip,
        school_name_s: submission.schoolName,
        opt_in: submission.optIn,
      })
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    );
    const queryString = new URLSearchParams(formData).toString();
    const response = await fetch(
      `/dashboardapi/v1/census/CensusYourSchool2017v7?${queryString}`,
      {
        method: 'POST',
      }
    );
    if (response.ok) {
      processResponse();
    } else {
      const result = await response.json();
      processError(result);
    }
  };

  const topicCheckbox = (name: string, label: string) => {
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

  const showErrorMsg = Object.values(errors).some(value => value === true);
  const US = submission.country === 'United States';
  let schoolId: string | undefined = prefillData.schoolId ?? '';
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
          onChange={(option: Option) => handleDropdownChange('country', option)}
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
                onChange={e => handleChange('schoolName', e)}
                style={styles.input}
              />
            </label>
          </div>
        )}
        {initialSchoolYear && (
          <div style={styles.question}>
            Please answer the questions below about the {initialSchoolYear}-
            {initialSchoolYear + 1} school year.
          </div>
        )}
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
              value={submission.hoc}
              onChange={e => handleChange('hoc', e)}
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
              value={submission.afterSchool}
              onChange={e => handleChange('afterSchool', e)}
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
              value={submission.tenHours}
              onChange={e => handleChange('tenHours', e)}
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
              value={submission.twentyHours}
              onChange={e => handleChange('twentyHours', e)}
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
                  onChange={updateOtherTopicsDesc}
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
                value={submission.followUpFrequency}
                onChange={e => handleChange('followUpFrequency', e)}
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
                name="tell_us_more"
                value={submission.followUpMore}
                onChange={e => handleChange('followUpMore', e)}
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
            value={submission.role}
            onChange={e => handleChange('role', e)}
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
              value={submission.email}
              onChange={e => handleChange('email', e)}
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
              value={submission.share}
              onChange={e => handleChange('share', e)}
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
          <label>
            {errors.optIn && (
              <div style={styles.errors}>
                Required. Please let us know if we can email you.
              </div>
            )}
            <span style={styles.share}>
              Can we email you about updates to our courses, local
              opportunities, or other computer science news? &nbsp;
              <a href="/privacy" target="_blank">
                (See our privacy policy)
              </a>
            </span>

            <select
              name="opt_in"
              value={submission.optIn}
              onChange={e => handleChange('optIn', e)}
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
          <label>
            <div style={styles.question}>{i18n.yourName()}</div>
            <input
              type="text"
              name="submitter_name"
              value={submission.name}
              onChange={e => handleChange('name', e)}
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
                onChange={togglePledge}
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
          onClick={(e: MouseEvent) => validateSubmission(e)}
          color={Button.ButtonColor.brandSecondaryDefault}
          text={i18n.submit()}
          size={Button.ButtonSize.large}
          style={{marginTop: '10px'}}
        />
      </form>
    </div>
  );
};
