import $ from 'jquery';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import CountryAutocompleteDropdown from '@cdo/apps/templates/CountryAutocompleteDropdown';
import { COUNTRIES } from '@cdo/apps/geographyConstants';
import SchoolNotFound from '@cdo/apps/templates/SchoolNotFound';
import i18n from "@cdo/locale";

const SCHOOL_TYPES_HAVING_NCES_SEARCH = ['charter', 'private', 'public'];

const SCHOOL_TYPES_HAVING_NAMES = [
  'charter',
  'private',
  'public',
  'afterschool',
  'organization',
];

function getCountryCodeForCountry(countryName) {
  return COUNTRIES.find(pair => pair.value === countryName).label;
}

export function setSchoolInfoFormData(signupForm, formData) {
  let schoolInfoDataMap;
  const ncesSchoolElement = signupForm.find(el => el.name === 'nces_school_s');
  if (ncesSchoolElement && ncesSchoolElement.value !== '-1') {
    schoolInfoDataMap = [
      {from: 'nces_school_s', to: 'school_id'},
      {from: 'country_s', to: 'country', transform: getCountryCodeForCountry},
    ];
    // Remove school type from the data to be submitted
    formData.splice(formData.findIndex(el => el.name === 'user[school_info_attributes][school_type]'), 1);
  } else {
    schoolInfoDataMap = [
      {from: 'country_s', to: 'country', transform: getCountryCodeForCountry},
      {from: 'school_name_s', to: 'school_name'},
      {from: 'school_state_s', to: 'school_state'},
      {from: 'school_zip_s', to: 'school_zip'},
      {from: 'registration_location', to: 'full_address'},
    ];
  }
  signupForm.forEach( function (el) {
    const match = schoolInfoDataMap.find(x => x.from === el.name);
    if (match) {
      const value = match.transform ? match.transform(el.value) : el.value;
      formData.push({name: "user[school_info_attributes][" + match.to + "]", value: value});
    }
  });
}

window.SignupManager = function (options) {
  this.options = options;
  var self = this;

  let schoolData = {
    country: options.usIP ? 'United States' : '',
    nces: '',
    schoolName: '',
    schoolCity: '',
    schoolState: '',
    schoolZip: '',
    schoolType: '',
    showErrorMsg: false,
  };

  // Check for URL having: /users/sign_up?user%5Buser_type%5D=teacher
  if (self.options.isTeacher === "true") {
    // Select teacher in dropdown.
    $("#user_user_type").val("teacher");

    showTeacher();
  }

  function formSuccess(success) {
    var url;
    if (self.options.returnToUrl !== "") {
      url = self.options.returnToUrl;
    } else if (isTeacherSelected()) {
      url = self.options.teacherDashboardUrl;
    } else {
      url = "/";
    }

    window.location.href = url;
  }

  function formError(err) {
    // re-enable "Sign up" button upon error
    $('#signup-button').prop('disabled', false);

    // Define the fields that can have specific errors attached to them.
    var fields = [
      "user_type",
      "name",
      "email",
      "password",
      "password_confirmation",
      "age",
      "gender",
      "terms_of_service_version",
      "school_info.zip"
    ];

    var fieldsWithErrors = 0;
    if (err.responseJSON && err.responseJSON.errors) {
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (err.responseJSON.errors[field]) {
          var errorField = $(`#${field}-block .error_in_field`);
          // We have a custom inline message for user_type errors already set in the DOM.
          if (field === "terms_of_service_version") {
            errorField.text(self.options.acceptTermsString);
          } else if (field === "school_info.zip") {
            errorField = $('#school-zip').find('.error_in_field');
            errorField.text(err.responseJSON.errors[field][0]);
          } else if (field !== "user_type") {
            errorField.text(err.responseJSON.errors[field][0]);
          }
          errorField.fadeTo("normal", 1);
          fieldsWithErrors++;
        }
      }
    }

    // if we did not receive a response that had field-specific error information,
    // show a generic error
    if (fieldsWithErrors === 0) {
      $('#signup-error').show();
    }

  }

  $("#user_user_type").change(function () {
    var value = $(this).val();
    if (value === "student") {
      showStudent();
    } else if (value === "teacher") {
      showTeacher();
    }
  });

  function setSchoolInfoVisibility(state) {
    if (state) {
      $("#schooldropdown-block").fadeIn();
    } else {
      $("#schooldropdown-block").hide();
    }
  }

  function showStudent() {
    // Show correct form elements.
    $("#age-block").fadeIn();
    $("#gender-block").fadeIn();
    $("#name-student").fadeIn();
    $("#name-teacher").hide();
    setSchoolInfoVisibility(false);

    // Show correct terms below form.
    $("#student-terms").fadeIn();
    $("#teacher-terms").hide();

    // Implicitly accept terms of service for students.
    $("#user_terms_of_service_version").prop('checked', true);
  }

  function onCountryChange(_, event) {
    schoolData.country = event ? event.value : '';
    updateAutocompleteSchoolFields(schoolData);
  }

  function onSchoolTypeChange(event) {
    schoolData.schoolType = event ? event.target.value : '';
    updateAutocompleteSchoolFields(schoolData);
  }

  function onSchoolChange(_, event) {
    schoolData.nces = event ? event.value : '';
    updateAutocompleteSchoolFields(schoolData);
  }

  function onSchoolNotFoundChange(field, event) {
    if (event) {
      schoolData = {
        ...schoolData,
        [field]: event.target.value
      };
    }
    updateAutocompleteSchoolFields(schoolData);
  }

  function updateAutocompleteSchoolFields(data) {
    const isUS = data.country === 'United States';
    ReactDOM.render(
      <div>
        <h5 style={{fontWeight: "bold"}}>
          {i18n.schoolInformationHeader()}
        </h5>
        <hr/>
        <CountryAutocompleteDropdown
          onChange={onCountryChange}
          value={data.country}
          showErrorMsg={false}
          singleLineLayout
        />
        <div className="itemblock" style={{minHeight:42}}>
          <div className="school-info-labelblock">{i18n.signupFormSchoolType()}</div>
          <select
            className="form-control fieldblock"
            id="school-type-auto"
            name="user[school_info_attributes][school_type]"
            type="select"
            defaultValue=""
            onChange={onSchoolTypeChange}
          >
            <option disabled="" value=""></option>
            <option value="charter">Charter</option>
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="homeschool">Homeschool</option>
            <option value="afterschool">After School</option>
            <option value="organization">Organization</option>
            <option value="other">Other</option>
          </select>
        </div>
        {isUS && SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(data.schoolType) &&
          <SchoolAutocompleteDropdownWithLabel
            setField={onSchoolChange}
            value={data.nces}
            showErrorMsg={false}
            singleLineLayout
            showRequiredIndicator={false}
          />
        }
        <SignupSchoolNotFound
          isUS={isUS}
          data={data}
          schoolDataErrors={{}}
          onSchoolNotFoundChange={onSchoolNotFoundChange}
        />
      </div>
      ,
      $("#schooldropdown-block")[0]
    );
  }

  function showTeacher() {
    // Show correct form elements.
    $("#age-block").hide();
    $("#gender-block").hide();
    $("#name-student").hide();
    $("#name-teacher").fadeIn();
    setSchoolInfoVisibility(true);

    // Show correct terms below form.
    $("#student-terms").hide();
    $("#teacher-terms").fadeIn();

    // Force teachers to explicitly accept terms of service.
    $("#user_terms_of_service_version").prop('checked', false);

    updateAutocompleteSchoolFields(schoolData);
  }

  function getUserTypeSelected() {
    const formData = $('#new_user').serializeArray();
    const userType = $.grep(formData, e => e.name === "user[user_type]");
    if (userType.length === 1) {
      return userType[0].value;
    }
    return "no_user_type";
  }

  function isTeacherSelected() {
    return getUserTypeSelected() === "teacher";
  }

  $(".signupform").submit(function () {
    // Clear the prior hashed email.
    $('#user_hashed_email').val('');
    // Hide error message if there is one from previous attempt
    $('#signup-error').hide();
    // Disable "Sign up" button to avoid multiple clicks while submitting
    $('#signup-button').prop('disabled', true);

    // Hash the email.
    window.dashboard.hashEmail({email_selector: "#user_email",
      hashed_email_selector: "#user_hashed_email",
      age_selector: "#user_user_age",
      skip_clear_email: true});

    const formData = $("#new_user").serializeArray();

    // Data transformations for school info
    const signupForm = $(".signupform").serializeArray();
    setSchoolInfoFormData(signupForm, formData);

    if (isTeacherSelected()) {
      // Teachers get age 21 in the form data.
      formData.push({name: "user[age]", value: "21+"});
    } else {
      // Students have their email cleared from the form data.
      // (But we left it showing in the form UI in case they
      // reattempt.)
      $.grep(formData, e => e.name === "user[email]")[0].value = "";
      $.grep(formData, e => e.name.startsWith("user[school_info_attributes]"))
        .forEach(x => x.value = "");
    }

    // Hide all errors that might be showing from a previous attempt.
    $(".error_in_field").css("opacity", 0);

    // Hide any other hint messages that might be showing based on input.
    $("#password_message").text("");
    $("#password_message_confirmation").text("");

    if (isTeacherSelected()) {
      updateAutocompleteSchoolFields(schoolData);
    }

    $.ajax({
      url: "/users.json",
      type: "post",
      dataType: "json",
      data: formData
    }).done(formSuccess).fail(formError);

    return false;
  });

  $("#user_password").on('input',function (e) {
    var password = $(this).val();
    var password_message = $("#password-block .error_in_field");
    var password_message_confirmation = $("#password_confirmation-block .error_in_field");
    if (!password || password.length < 6) {
      password_message.text(self.options.invalidPasswordString);
      password_message.fadeTo("normal", 1);
    } else {
      password_message.text("");
    }
    password_message_confirmation.text("");
  });

  $("#user_password_confirmation").on('input', function (e) {
    var conf_password = $(this).val();
    var origin_password = $('#user_password').val();
    var password_message = $("#password-block .error_in_field");
    var password_message_confirmation = $("#password_confirmation-block .error_in_field");
    if (conf_password !== origin_password) {
      password_message_confirmation.text(self.options.passwordMismatchString);
      password_message_confirmation.fadeTo("normal", 1);
    } else {
      password_message_confirmation.text("");
    }
    password_message.text("");
  });

  $("#user_name").placeholder();
  $("#user_email").placeholder();
  $("#user_school").placeholder();
};

class SignupSchoolNotFound extends React.Component {
  static propTypes = {
    isUS: PropTypes.bool.isRequired,
    data: PropTypes.object.isRequired,
    schoolDataErrors: PropTypes.object.isRequired,
    onSchoolNotFoundChange: PropTypes.func.isRequired,
  };

  render() {
    const {
      isUS,
      data,
      schoolDataErrors,
      onSchoolNotFoundChange,
    } = this.props;

    const outsideUS = !isUS;
    const ncesInfoNotFound = (data.nces === '-1');
    const noDropdownForSchoolType = (
      !SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(data.schoolType)
      && data.schoolType !== ''
    );
    if (outsideUS || ncesInfoNotFound || noDropdownForSchoolType) {
      const askForName = SCHOOL_TYPES_HAVING_NAMES.includes(data.schoolType);
      const schoolNameLabel = ['afterschool', 'organization'].includes(data.schoolType)
        ? i18n.signupFormSchoolOrOrganization()
        : i18n.schoolName();
      return (
        <SchoolNotFound
          onChange={onSchoolNotFoundChange}
          schoolName={askForName ? data.schoolName : SchoolNotFound.OMIT_FIELD}
          schoolType={SchoolNotFound.OMIT_FIELD}
          schoolCity={data.schoolCity}
          schoolState={isUS ? data.schoolState : SchoolNotFound.OMIT_FIELD}
          schoolZip={isUS ? data.schoolZip : SchoolNotFound.OMIT_FIELD}
          showErrorMsg={schoolDataErrors.school}
          singleLineLayout
          showRequiredIndicators={false}
          schoolNameLabel={schoolNameLabel}
          useGoogleLocationSearch={true}
        />
      );
    }
    return null;
  }
}
