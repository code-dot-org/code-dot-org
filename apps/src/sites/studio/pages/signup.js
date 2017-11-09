import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import SchoolNotFound from '@cdo/apps/templates/SchoolNotFound';
import firehoseClient from '@cdo/apps/lib/util/firehose';

window.SignupManager = function (options) {
  this.options = options;
  var self = this;

  // Check for URL having: /users/sign_up?user%5Buser_type%5D=teacher
  if (self.options.isTeacher === "true") {
    // Select teacher in dropdown.
    $("#user_user_type").val("teacher");

    showTeacher();
  }

  function formSuccess(success) {
    if (urlFlagInPlace() && isTeacherSelected()) {
      logEvent('teacher-submit-success');
    }
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
    if (urlFlagInPlace() && isTeacherSelected()) {
      logEvent('teacher-submit-error');
    }

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

  const registrationSchoolStyleGroup = (Math.random() < .5) ? "control" : "autocomplete";

  function logEvent(event) {
    firehoseClient.putRecord(
      'analysis-events',
      {
        study: 'teacher-registration-school-style',
        study_group: registrationSchoolStyleGroup,
        event: event
      }
    );
  }

  let schoolData = {
    name: '',
    country: 'US',
    nces: '',
    schoolName: '',
    schoolCity: '',
    schoolState: '',
    schoolZip: '',
    schoolType: 'omitted',
    afterSchool: ''
  };

  function onCountryChange(field, event) {
    schoolData.nces = event ? event.value : '';
    updateAutocompleteSchoolFields(schoolData);
  }

  function onSchoolTypeChange(field, event) {
    schoolData.schoolType = event ? event.value : '';
    updateAutocompleteSchoolFields(schoolData);
  }

  function onSchoolChange(field, event) {
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
    ReactDOM.render(
      <div>
        <div className="itemblock" id="school-country-group">
          <div className="school-info-labelblock">School Country</div>
          <select
            className="form-control fieldblock"
            id="school-country-auto"
            name="user[school_info_attributes][country]"
            type="select"
            defaultValue="US"
            onChange={onCountryChange}
          >
            <option disabled="" value=""></option>
            <option value="US">United States</option>
            <option value="AD">Andorra</option>
            <option value="AE">United Arab Emirates</option>
            <option value="AF">Afghanistan</option>
            <option value="AG">Antigua and Barbuda</option>
            <option value="AI">Anguilla</option>
            <option value="AL">Albania</option>
            <option value="AM">Armenia</option>
            <option value="AO">Angola</option>
            <option value="AQ">Antarctica</option>
            <option value="AR">Argentina</option>
            <option value="AS">American Samoa</option>
            <option value="AT">Austria</option>
            <option value="AU">Australia</option>
            <option value="AW">Aruba</option>
            <option value="AX">Åland Islands</option>
            <option value="AZ">Azerbaijan</option>
            <option value="BA">Bosnia and Herzegovina</option>
            <option value="BB">Barbados</option>
            <option value="BD">Bangladesh</option>
            <option value="BE">Belgium</option>
            <option value="BF">Burkina Faso</option>
            <option value="BG">Bulgaria</option>
            <option value="BH">Bahrain</option>
            <option value="BI">Burundi</option>
            <option value="BJ">Benin</option>
            <option value="BL">Saint Barthélemy</option>
            <option value="BM">Bermuda</option>
            <option value="BN">Brunei</option>
            <option value="BO">Plurinational State of Bolivia</option>
            <option value="BQ">Bonaire</option>
            <option value="BR">Brazil</option>
            <option value="BS">Bahamas</option>
            <option value="BT">Bhutan</option>
            <option value="BV">Bouvet Island</option>
            <option value="BW">Botswana</option>
            <option value="BY">Belarus</option>
            <option value="BZ">Belize</option>
            <option value="CA">Canada</option>
            <option value="CC">Cocos (Keeling) Islands</option>
            <option value="CD">Democratic Republic of Congo</option>
            <option value="CF">Central African Republic</option>
            <option value="CG">Congo</option>
            <option value="CH">Switzerland</option>
            <option value="CI">Côte d'Ivoire</option>
            <option value="CK">Cook Islands</option>
            <option value="CL">Chile</option>
            <option value="CM">Cameroon</option>
            <option value="CN">China</option>
            <option value="CO">Colombia</option>
            <option value="CR">Costa Rica</option>
            <option value="CU">Cuba</option>
            <option value="CV">Cape Verde</option>
            <option value="CW">Curaçao</option>
            <option value="CX">Christmas Island</option>
            <option value="CY">Cyprus</option>
            <option value="CZ">Czech Republic</option>
            <option value="DE">Germany</option>
            <option value="DJ">Djibouti</option>
            <option value="DK">Denmark</option>
            <option value="DM">Dominica</option>
            <option value="DO">Dominican Republic</option>
            <option value="DZ">Algeria</option>
            <option value="EC">Ecuador</option>
            <option value="EE">Estonia</option>
            <option value="EG">Egypt</option>
            <option value="EH">Western Sahara</option>
            <option value="ER">Eritrea</option>
            <option value="ES">Spain</option>
            <option value="ET">Ethiopia</option>
            <option value="FI">Finland</option>
            <option value="FJ">Fiji</option>
            <option value="FK">Falkland Islands (Malvinas)</option>
            <option value="FM">Micronesia</option>
            <option value="FO">Faroe Islands</option>
            <option value="FR">France</option>
            <option value="GA">Gabon</option>
            <option value="GB">United Kingdom</option>
            <option value="GD">Grenada</option>
            <option value="GE">Georgia</option>
            <option value="GF">French Guiana</option>
            <option value="GG">Guernsey</option>
            <option value="GH">Ghana</option>
            <option value="GI">Gibraltar</option>
            <option value="GL">Greenland</option>
            <option value="GM">Gambia</option>
            <option value="GN">Guinea</option>
            <option value="GP">Guadeloupe</option>
            <option value="GQ">Equatorial Guinea</option>
            <option value="GR">Greece</option>
            <option value="GS">South Georgia and the South Sandwich Islands</option>
            <option value="GT">Guatemala</option>
            <option value="GU">Guam</option>
            <option value="GW">Guinea-Bissau</option>
            <option value="GY">Guyana</option>
            <option value="HK">Hong Kong</option>
            <option value="HM">Heard Island and McDonald Islands</option>
            <option value="HN">Honduras</option>
            <option value="HR">Croatia</option>
            <option value="HT">Haiti</option>
            <option value="HU">Hungary</option>
            <option value="ID">Indonesia</option>
            <option value="IE">Ireland</option>
            <option value="IL">Israel</option>
            <option value="IM">Isle of Man</option>
            <option value="IN">India</option>
            <option value="IO">British Indian Ocean Territory</option>
            <option value="IQ">Iraq</option>
            <option value="IR">Islamic Republic of Iran</option>
            <option value="IS">Iceland</option>
            <option value="IT">Italy</option>
            <option value="JE">Jersey</option>
            <option value="JM">Jamaica</option>
            <option value="JO">Jordan</option>
            <option value="JP">Japan</option>
            <option value="KE">Kenya</option>
            <option value="KG">Kyrgyzstan</option>
            <option value="KH">Cambodia</option>
            <option value="KI">Kiribati</option>
            <option value="KM">Comoros</option>
            <option value="KN">Saint Kitts and Nevis</option>
            <option value="KP">Democratic People's Republic of Korea</option>
            <option value="KR">Republic of Korea</option>
            <option value="KW">Kuwait</option>
            <option value="KY">Cayman Islands</option>
            <option value="KZ">Kazakhstan</option>
            <option value="LA">Lao People's Democratic Republic</option>
            <option value="LB">Lebanon</option>
            <option value="LC">Saint Lucia</option>
            <option value="LI">Liechtenstein</option>
            <option value="LK">Sri Lanka</option>
            <option value="LR">Liberia</option>
            <option value="LS">Lesotho</option>
            <option value="LT">Lithuania</option>
            <option value="LU">Luxembourg</option>
            <option value="LV">Latvia</option>
            <option value="LY">Libya</option>
            <option value="MA">Morocco</option>
            <option value="MC">Monaco</option>
            <option value="MD">Moldova</option>
            <option value="ME">Montenegro</option>
            <option value="MG">Madagascar</option>
            <option value="MH">Marshall Islands</option>
            <option value="MK">Republic of Macedonia</option>
            <option value="ML">Mali</option>
            <option value="MM">Myanmar</option>
            <option value="MN">Mongolia</option>
            <option value="MO">Macao</option>
            <option value="MP">Northern Mariana Islands</option>
            <option value="MQ">Martinique</option>
            <option value="MR">Mauritania</option>
            <option value="MS">Montserrat</option>
            <option value="MT">Malta</option>
            <option value="MU">Mauritius</option>
            <option value="MV">Maldives</option>
            <option value="MW">Malawi</option>
            <option value="MX">Mexico</option>
            <option value="MY">Malaysia</option>
            <option value="MZ">Mozambique</option>
            <option value="NA">Namibia</option>
            <option value="NC">New Caledonia</option>
            <option value="NE">Niger</option>
            <option value="NF">Norfolk Island</option>
            <option value="NG">Nigeria</option>
            <option value="NI">Nicaragua</option>
            <option value="NL">Netherlands</option>
            <option value="NO">Norway</option>
            <option value="NP">Nepal</option>
            <option value="NR">Nauru</option>
            <option value="NU">Niue</option>
            <option value="NZ">New Zealand</option>
            <option value="OM">Oman</option>
            <option value="PA">Panama</option>
            <option value="PE">Peru</option>
            <option value="PF">French Polynesia</option>
            <option value="PG">Papua New Guinea</option>
            <option value="PH">Philippines</option>
            <option value="PK">Pakistan</option>
            <option value="PL">Poland</option>
            <option value="PM">Saint Pierre and Miquelon</option>
            <option value="PN">Pitcairn</option>
            <option value="PR">Puerto Rico</option>
            <option value="PS">Palestine</option>
            <option value="PT">Portugal</option>
            <option value="PW">Palau</option>
            <option value="PY">Paraguay</option>
            <option value="QA">Qatar</option>
            <option value="RE">Réunion</option>
            <option value="RO">Romania</option>
            <option value="RS">Serbia</option>
            <option value="RU">Russian Federation</option>
            <option value="RW">Rwanda</option>
            <option value="SA">Saudi Arabia</option>
            <option value="SB">Solomon Islands</option>
            <option value="SC">Seychelles</option>
            <option value="SD">Sudan</option>
            <option value="SE">Sweden</option>
            <option value="SG">Singapore</option>
            <option value="SI">Slovenia</option>
            <option value="SJ">Svalbard and Jan Mayen</option>
            <option value="SK">Slovakia</option>
            <option value="SL">Sierra Leone</option>
            <option value="SM">San Marino</option>
            <option value="SN">Senegal</option>
            <option value="SO">Somalia</option>
            <option value="SR">Suriname</option>
            <option value="SS">South Sudan</option>
            <option value="ST">Sao Tome and Principe</option>
            <option value="SV">El Salvador</option>
            <option value="SX">Sint Maarten (Dutch part)</option>
            <option value="SY">Syrian Arab Republic</option>
            <option value="SZ">Swaziland</option>
            <option value="TC">Turks and Caicos Islands</option>
            <option value="TD">Chad</option>
            <option value="TG">Togo</option>
            <option value="TH">Thailand</option>
            <option value="TJ">Tajikistan</option>
            <option value="TK">Tokelau</option>
            <option value="TL">Timor-Leste</option>
            <option value="TM">Turkmenistan</option>
            <option value="TN">Tunisia</option>
            <option value="TO">Tonga</option>
            <option value="TR">Turkey</option>
            <option value="TT">Trinidad and Tobago</option>
            <option value="TV">Tuvalu</option>
            <option value="TW">Taiwan</option>
            <option value="TZ">Tanzania</option>
            <option value="UA">Ukraine</option>
            <option value="UG">Uganda</option>
            <option value="UY">Uruguay</option>
            <option value="UZ">Uzbekistan</option>
            <option value="VA">Holy See (Vatican City State)</option>
            <option value="VC">Saint Vincent and the Grenadines</option>
            <option value="VE">Bolivarian Republic of Venezuela</option>
            <option value="VG">Virgin Islands, British</option>
            <option value="VI">Virgin Islands, U.S.</option>
            <option value="VN">Viet Nam</option>
            <option value="VU">Vanuatu</option>
            <option value="WF">Wallis and Futuna</option>
            <option value="WS">Samoa</option>
            <option value="XK">Kosovo</option>
            <option value="YE">Yemen</option>
            <option value="YT">Mayotte</option>
            <option value="ZA">South Africa</option>
            <option value="ZM">Zambia</option>
            <option value="ZW">Zimbabwe</option>
          </select>
        </div>
        <div className="itemblock">
          <div className="school-info-labelblock">School Type</div>
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
        {data['country'] === 'US' &&
          <SchoolAutocompleteDropdown
            setField={onSchoolChange}
            value={data['school_id']}
            showErrorMsg={false}
          />
        }
        {data['country'] === 'US' && data['nces'] === '-1' &&
          <SchoolNotFound
            onChange={onSchoolNotFoundChange}
            schoolName={data.schoolName}
            schoolType="omitted"
            schoolCity={data.schoolCity}
            schoolState={data.schoolState}
            schoolZip={data.schoolZip}
            // showErrorMsg={errors.school}
          />
        }
      </div>
      ,
      $("#schooldropdown-block")[0]
    );
  }

  let loggedTeacherSelected = false;
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

    if (urlFlagInPlace() && !loggedTeacherSelected) {
      logEvent('teacher-selected');
      loggedTeacherSelected = true;
    }

    if (shouldUseAutocompleteDropdown()) {
      updateAutocompleteSchoolFields(schoolData);
    }
  }

  function urlFlagInPlace() {
    return window.location.href.lastIndexOf("enableAutocompleteDropdown=true") > 0;
  }

  function shouldUseAutocompleteDropdown() {
    return urlFlagInPlace() && registrationSchoolStyleGroup === 'autocomplete';
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

    if (shouldUseAutocompleteDropdown()) {
      const signupForm = $(".signupform").serializeArray();
      let schoolID = null;
      signupForm.forEach( function (el) {
        if (el.name === "nces_school_s") {
          schoolID = el.value;
        }
      });
      formData.push({name: "user[school_info_attributes][school_id]", value: schoolID});
    }

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

    if (urlFlagInPlace() && isTeacherSelected()) {
      logEvent('teacher-submitted');
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
