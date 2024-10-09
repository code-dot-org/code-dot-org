import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import color from '@cdo/apps/util/color';

import styleConstants from '../../styleConstants';
import SchoolInfoInputs from '../SchoolInfoInputs';

export default function CensusTeacherBanner({
  onDismiss,
  onPostpone,
  onTeachesChange,
  onInClassChange,
  initialNcesSchoolId,
  question,
  teaches,
  inClass,
  teacherName,
  teacherEmail,
  onSubmitSuccess,
  schoolYear,
}) {
  const [showSchoolInfoForm, setShowSchoolInfoForm] = useState(false);
  const [showSchoolInfoUnknownError, setShowSchoolInfoUnknownError] =
    useState(false);
  const [censusSubmittedSuccessfully, setCensusSubmittedSuccessfully] =
    useState(null);
  const [showCensusInvalidError, setShowCensusInvalidError] = useState(false);
  const [showCensusUnknownError, setShowCensusUnknownError] = useState(false);

  const [country, setCountry] = useState('United States');
  const [schoolType, setSchoolType] = useState('');
  const [ncesSchoolId, setNcesSchoolId] = useState(initialNcesSchoolId);
  const [schoolName, setSchoolName] = useState('');
  const [schoolDisplayName, setSchoolDisplayName] = useState(null);
  const [schoolState, setSchoolState] = useState('');
  const [schoolZip, setSchoolZip] = useState('');
  const [schoolLocation, setSchoolLocation] = useState('');
  const [showSchoolInfoErrors, setShowSchoolInfoErrors] = useState(false);
  const schoolInfoInputs = useRef(null);

  const loadSchoolNameSuccess = response => {
    setSchoolDisplayName(response.name);
    setSchoolType(response.school_type);
  };

  const loadSchoolNameError = error => {
    setSchoolDisplayName('your school');
  };

  const loadSchoolName = useCallback(schoolId => {
    if (schoolId && schoolId !== '-1') {
      $.ajax({
        url: `/api/v1/schools/${schoolId}`,
        type: 'get',
      })
        .done(loadSchoolNameSuccess)
        .fail(loadSchoolNameError);
    } else {
      setSchoolDisplayName('');
    }
  }, []);

  useEffect(() => {
    loadSchoolName(ncesSchoolId);
  }, [ncesSchoolId, loadSchoolName]);

  const handleCountryChange = (_, event) => {
    const newCountry = event ? event.value : '';
    setCountry(newCountry);
  };

  const handleSchoolTypeChange = event => {
    const newType = event ? event.target.value : '';
    setSchoolType(newType);
  };

  const handleSchoolChange = (_, event) => {
    const newSchool = event ? event.value : '';
    setNcesSchoolId(newSchool);
  };

  const handleSchoolNotFoundChange = (field, event) => {
    const value = event ? event.target.value : '';
    switch (field) {
      case 'schoolType':
        setSchoolType(value);
        break;
      case 'schoolName':
        setSchoolName(value);
        break;
      case 'schoolLocation':
        setSchoolLocation(value);
        break;
      default:
        console.warn(`Unknown field: ${field}`);
    }
  };

  const hideSchoolInfoForm = () => {
    setShowSchoolInfoForm(false);
    setShowSchoolInfoErrors(false);
  };

  const dismissSchoolInfoForm = () => {
    // This is handling the case where the user dismissed the
    // "update your school" view, not the entire banner. In that case, there
    // may have been partial state about the school changed. We do not want
    // to use that partial state in the census submission so we need to reset
    // to the previous values.
    setShowSchoolInfoForm(false);
    setCountry('United States');
    setSchoolType('');
    setNcesSchoolId(null);
    setSchoolName('');
    setSchoolDisplayName(null);
    setSchoolState('');
    setSchoolZip('');
    setSchoolLocation('');
    setShowSchoolInfoErrors(false);
    setShowSchoolInfoUnknownError(false);
  };

  const handleSchoolInfoSubmit = () => {
    if (schoolInfoInputs.current.isValid()) {
      let schoolData;
      if (ncesSchoolId === '-1') {
        schoolData = {
          _method: 'patch',
          'user[school_info_attributes][country]': country,
          'user[school_info_attributes][school_type]': schoolType,
          'user[school_info_attributes][school_name]': schoolName,
          'user[school_info_attributes][school_state]': schoolState,
          'user[school_info_attributes][school_zip]': schoolZip,
          'user[school_info_attributes][full_address]': schoolLocation,
        };
      } else {
        schoolData = {
          _method: 'patch',
          'user[school_info_attributes][school_id]': ncesSchoolId,
        };
      }
      $.ajax({
        url: '/users.json',
        type: 'post',
        dataType: 'json',
        data: schoolData,
      })
        .done(hideSchoolInfoForm)
        .fail(updateSchoolInfoError);
    } else {
      setShowSchoolInfoErrors(true);
    }
  };

  const updateSchoolInfoError = () => {
    // It isn't clear what could cause an error here since none of the fields are required.
    setShowSchoolInfoUnknownError(true);
  };

  const isValid = () => {
    return !teaches || inClass === true || inClass === false;
  };

  const getData = () => {
    let data = {
      submitter_role: 'TEACHER',
      submitter_name: teacherName,
      submitter_email_address: teacherEmail,
      school_year: schoolYear,
    };
    const dataQuestion = inClass ? question : 'how_many_after_school';
    data[dataQuestion] = 'SOME';

    if (ncesSchoolId === '-1') {
      data['country_s'] = country;
      data['school_type_s'] = schoolType;
      data['school_name_s'] = schoolName;
      data['school_state_s'] = schoolState;
      data['school_zip_s'] = schoolZip;
      data['school_location'] = schoolLocation;
    } else {
      data['nces_school_s'] = ncesSchoolId;
    }

    return data;
  };

  const handleCensusBannerSubmit = () => {
    if (isValid()) {
      $.ajax({
        url: '/dashboardapi/v1/census/CensusTeacherBannerV1',
        type: 'post',
        dataType: 'json',
        data: getData(),
      })
        .done(() => {
          setCensusSubmittedSuccessfully(true);
          onSubmitSuccess();
        })
        .fail(() => {
          setShowCensusUnknownError(true);
        });
    } else {
      setShowCensusInvalidError(true);
    }
  };

  const renderThankYou = () => {
    const yourschoolUrl = encodeURIComponent('https://code.org/yourschool');
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${yourschoolUrl}`;
    const twitterText = encodeURIComponent(
      'Does your school teach computer science? Expand computer science at your school or district. @codeorg'
    );
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${yourschoolUrl}&related=codeorg&text=${twitterText}`;

    return (
      <div>
        <div style={styles.header}>
          <h2>Thanks for adding your school to the map!</h2>
        </div>
        <div style={styles.message}>
          <p style={styles.introQuestion}>
            Help us find out about computer science opportunities at every
            school in the United States!
          </p>
        </div>
        <div style={styles.share}>
          <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer">
            <button type="button" style={styles.shareButton}>
              <i className="fa fa-facebook" /> Share on Facebook
            </button>
          </a>
          <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
            <button type="button" style={styles.shareButton}>
              <i className="fa fa-twitter" /> Share on Twitter
            </button>
          </a>
        </div>
      </div>
    );
  };

  const renderSchoolInfoForm = () => {
    return (
      <div>
        <div style={styles.header}>
          <h2>Update your school information</h2>
          {showSchoolInfoUnknownError && (
            <p style={styles.error}>
              We encountered an error with your submission. Please try again.
            </p>
          )}
        </div>
        <div style={styles.message}>
          <SchoolInfoInputs
            ref={schoolInfoInputs}
            onCountryChange={handleCountryChange}
            onSchoolTypeChange={handleSchoolTypeChange}
            onSchoolChange={handleSchoolChange}
            onSchoolNotFoundChange={handleSchoolNotFoundChange}
            country={country}
            schoolType={schoolType}
            ncesSchoolId={ncesSchoolId}
            schoolName={schoolName}
            schoolState={schoolState}
            schoolZip={schoolZip}
            schoolLocation={schoolLocation}
            useLocationSearch={true}
            showErrors={showSchoolInfoErrors}
            showRequiredIndicator={true}
          />
        </div>
        <div style={styles.buttonDiv}>
          <Button
            __useDeprecatedTag
            onClick={dismissSchoolInfoForm}
            style={styles.button}
            color="gray"
            size="large"
            text="Dismiss"
          />
          <Button
            __useDeprecatedTag
            onClick={handleSchoolInfoSubmit}
            style={styles.button}
            size="large"
            text="Submit"
          />
        </div>
      </div>
    );
  };

  const renderCensusForm = () => {
    const numHours = question === 'how_many_20_hours' ? '20' : '10';
    let buttons;
    let footer;
    if (teaches === true) {
      footer = <hr />;
      buttons = (
        <div style={styles.buttonDiv}>
          <Button
            __useDeprecatedTag
            onClick={onDismiss}
            style={styles.button}
            color={Button.ButtonColor.neutralDark}
            text="No thanks"
          />
          <Button
            __useDeprecatedTag
            onClick={handleCensusBannerSubmit}
            style={styles.button}
            color={Button.ButtonColor.brandSecondaryDefault}
            text="Add my school to the map!"
          />
        </div>
      );
    } else if (teaches === false) {
      footer = (
        <div>
          <hr />
          <p>
            We’d love to know more about computer science opportunities at your
            school. Please take our survey to increase access to Computer
            Science in the US.
          </p>
        </div>
      );
      const link = encodeURI(
        `/yourschool?schoolId=${ncesSchoolId}&isTeacher=true&name=${teacherName}&email=${teacherEmail}#form`
      );
      buttons = (
        <div style={styles.buttonDiv}>
          <Button
            __useDeprecatedTag
            onClick={onPostpone}
            style={styles.button}
            color="gray"
            size="large"
            text="Not now"
          />
          <Button
            __useDeprecatedTag
            onClick={onPostpone}
            href={pegasus(link)}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.button}
            size="large"
            text="Take the survey"
          />
        </div>
      );
    }

    let schoolNameForDisplay;

    if (schoolDisplayName) {
      schoolNameForDisplay = schoolDisplayName;
    } else if (schoolName) {
      schoolNameForDisplay = schoolName;
    }

    if (schoolNameForDisplay) {
      return (
        <div>
          <div style={styles.header}>
            <h2 style={styles.title}>Add {schoolNameForDisplay} to our map!</h2>
            <p style={styles.updateSchool}>
              Not teaching at this school anymore?&ensp;
              <a
                style={styles.updateSchoolLink}
                onClick={() => setShowSchoolInfoForm(true)}
              >
                Update here
              </a>
            </p>
            {showCensusUnknownError && (
              <p style={styles.error}>
                We encountered an error with your submission. Please try again.
              </p>
            )}
          </div>
          <div style={styles.message}>
            <p style={styles.introQuestion}>
              It looks like you teach computer science. Have your students
              already done {numHours} hours of programming content this year
              (not including HTML/CSS)?
            </p>
            <label>
              <input
                type="radio"
                id="teachesYes"
                name={question}
                value="SOME"
                style={styles.radio}
                onChange={onTeachesChange}
                checked={teaches === true}
              />
              Yes, we’ve done {numHours} hours.
            </label>
            <label>
              <input
                type="radio"
                id="teachesNo"
                name={question}
                style={styles.radio}
                onChange={onTeachesChange}
                value="not yet"
                checked={teaches === false}
              />
              Not yet.
            </label>
            {teaches && showCensusInvalidError && (
              <p style={styles.error}>
                Please select one of the options below.
              </p>
            )}
            {teaches && (
              <div>
                <p style={styles.introQuestion}>
                  Which of the following best describes where you teach
                  programming?
                </p>
                <label>
                  <input
                    type="radio"
                    id="inClass"
                    value="inclass"
                    style={styles.radio}
                    onChange={onInClassChange}
                    checked={inClass === true}
                  />
                  In a classroom
                </label>
                <label>
                  <input
                    type="radio"
                    id="afterSchool"
                    style={styles.radio}
                    onChange={onInClassChange}
                    value="afterschool"
                    checked={inClass === false}
                  />
                  In an afterschool program or club
                </label>
              </div>
            )}
            {footer}
          </div>
          {buttons}
        </div>
      );
    } else {
      // Don't display until school name has been loaded
      return null;
    }
  };

  let mainForm;

  if (censusSubmittedSuccessfully) {
    mainForm = renderThankYou();
  } else if (showSchoolInfoForm) {
    mainForm = renderSchoolInfoForm();
  } else {
    mainForm = renderCensusForm();
  }

  return (
    <div style={styles.main}>
      <div style={styles.image}>
        <img
          src="/shared/images/misc/census-map-with-flag.png"
          alt="Map with flag"
          width="180"
          height="180"
        />
      </div>
      {mainForm}
      <div style={styles.clear} />
    </div>
  );
}

CensusTeacherBanner.propTypes = {
  onDismiss: PropTypes.func.isRequired,
  onPostpone: PropTypes.func.isRequired,
  onTeachesChange: PropTypes.func.isRequired,
  onInClassChange: PropTypes.func.isRequired,
  initialNcesSchoolId: PropTypes.string,
  question: PropTypes.string.isRequired,
  teaches: PropTypes.bool,
  inClass: PropTypes.bool,
  teacherName: PropTypes.string.isRequired,
  teacherEmail: PropTypes.string.isRequired,
  onSubmitSuccess: PropTypes.func.isRequired,
  schoolYear: PropTypes.number.isRequired,
};

const styles = {
  button: {
    marginLeft: 7,
    marginRight: 7,
    marginTop: 15,
    marginBottom: 15,
  },
  buttonDiv: {
    textAlign: 'center',
  },
  clear: {
    clear: 'both',
  },
  error: {
    color: color.red,
  },
  header: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20,
  },
  image: {
    float: 'right',
    margin: 5,
  },
  introQuestion: {
    marginTop: 10,
    marginBottom: 5,
  },
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.teal,
    minHeight: 72,
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    overflowWrap: 'break-word',
  },
  message: {
    marginTop: 0,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  radio: {
    verticalAlign: 'top',
    marginRight: 10,
  },
  share: {
    textAlign: 'center',
  },
  shareButton: {
    color: color.white,
    backgroundColor: color.brand_primary_default,
    boxShadow: 'none',
    minWidth: 40,
  },
  title: {
    marginBottom: 0,
  },
  updateSchool: {
    fontSize: '85%',
    marginTop: 0,
    marginBottom: 0,
  },
  updateSchoolLink: {
    cursor: 'pointer',
    ...fontConstants['main-font-semi-bold'],
  },
};
