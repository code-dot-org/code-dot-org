import {assert} from '../util/configuredChai';
import {setExternalGlobals} from './../util/testUtils';
import React from 'react';
import {mount} from 'enzyme';

import FacilitatorProgramRegistration from '@cdo/apps/code-studio/pd/facilitator_program_registration/FacilitatorProgramRegistration';

describe('FacilitatorProgramRegistration', function () {
  setExternalGlobals();

  const DEFAULTS = {
    apiEndpoint: "",
    course: "",
    options: {
      "confirmTeacherconDate": ["Yes", "No - but I need to attend a different date.", "No - I'm no longer interested"],
      "alternateTeacherconDate": ["TeacherCon 1: June 18 - 23", "TeacherCon 2: July 16 - 21", "TeacherCon 3: July 30 - August 4"],
      "confirmTrainingDate": ["Yes", "No"],
      "declineTrainingDate": ["I want to participate in the program, but I'm no longer able to attend these dates.", "I am no longer interested in the Code.org Facilitator Development Program."],
      "csdAlternateTrainingDate": ["July 22 - 23 (immediately following TeacherCon 2)", "August 5 - 6 (immediately following TeacherCon 3)"],
      "cspAlternateTrainingDate": ["June 24 - 25 (immediately following TeacherCon 1)", "July 22 - 23 (immediately following TeacherCon 2)", "August 5 - 6 (immediately following TeacherCon 3)"],
      "addressState": {
        "AL": "Alabama",
        "DC": "Washington DC"
      },
      "dietaryNeeds": ["None", "Vegetarian", "Gluten Free", "Food allergy", "Other"],
      "liveFarAway": ["Yes", "No"],
      "howTraveling": ["Driving", "Flying", "Train", "Carpooling with another attendee", "Public transit"],
      "needHotel": ["Yes", "No"],
      "needAda": ["Yes", "No"],
      "photoRelease": ["Yes"],
      "liabilityWaiver": ["Yes"],
      "gender": ["Male", "Female", "Other", "Prefer not to say"],
      "race": ["White", "Black or African American", "Hispanic or Latino", "Asian", "Native Hawaiian or other Pacific Islander", "American Indian/Alaska Native", "Other", "Prefer not to say"],
      "age": ["21-25", "26-30", "31-35", "36-40", "41-45", "46-50", "51-55", "56-60", "61-65", "66+", "Prefer not to say"],
      "gradesTaught": ["Pre-K", "Elementary", "Middle School/Junior High", "High School", "I am not teaching"],
      "gradesPlanningToTeach": ["Pre-K", "Elementary", "Middle School/Junior High", "High School", "I am not teaching this course"],
      "subjectsTaught": ["Computer Science", "English/Language Arts", "Science", "Math", "Arts/Music", "Other"]
    },
    requiredFields: [
      "addressStreet",
      "addressCity",
      "addressState",
      "addressZip",
      "contactName",
      "contactRelationship",
      "contactPhone",
      "dietaryNeeds",
      "liveFarAway",
      "howTraveling",
      "needHotel",
      "needAda",
      "photoRelease",
      "liabilityWaiver",
      "gender",
      "race",
      "age",
      "gradesTaught",
      "gradesPlanningToTeach",
      "subjectsTaught",
    ],
    attendanceDates: {},
    teachercon: 1,
    teacherconLocation: "Whereever"
  };

  // componentDidUpdate contains some jquery that doesn't play nice with the
  // testing environment. Stub it out for these test.
  FacilitatorProgramRegistration.prototype.componentDidUpdate = () => {};

  it('renders confirmations for the given dates', function () {
    const onlyTeachercon = mount(
      <FacilitatorProgramRegistration
        {...DEFAULTS}
        attendanceDates={{
          teachercon: {
            arrive: "",
            depart: ""
          }
        }}
      />
    );
    assert.lengthOf(onlyTeachercon.find("#confirmTeacherconDate"), 1);
    assert.lengthOf(onlyTeachercon.find("#confirmTrainingDate"), 0);

    const onlyTraining = mount(
      <FacilitatorProgramRegistration
        {...DEFAULTS}
        attendanceDates={{
          training: {
            arrive: "",
            depart: ""
          }
        }}
      />
    );
    assert.lengthOf(onlyTraining.find("#confirmTeacherconDate"), 0);
    assert.lengthOf(onlyTraining.find("#confirmTrainingDate"), 1);

    const both = mount(
      <FacilitatorProgramRegistration
        {...DEFAULTS}
        attendanceDates={{
          teachercon: {
            arrive: "",
            depart: ""
          },
          training: {
            arrive: "",
            depart: ""
          }
        }}
      />
    );
    assert.lengthOf(both.find("#confirmTeacherconDate"), 1);
    assert.lengthOf(both.find("#confirmTrainingDate"), 1);
  });

  it('ends the form early if either date is declined', function () {
    const assertNextNotSubmit = function () {
      assert.lengthOf(wrapper.find("button[type='button']"), 1);
      assert.lengthOf(wrapper.find("button[type='submit']"), 0);
    };

    const assertSubmitNotNext = function () {
      assert.lengthOf(wrapper.find("button[type='button']"), 0);
      assert.lengthOf(wrapper.find("button[type='submit']"), 1);
    };

    const wrapper = mount(
      <FacilitatorProgramRegistration
        {...DEFAULTS}
        attendanceDates={{
          teachercon: {
            arrive: "",
            depart: ""
          },
          training: {
            arrive: "",
            depart: ""
          }
        }}
      />
    );

    assertNextNotSubmit();

    wrapper.instance().handleChange({
      confirmTeacherconDate: "No - I'm no longer interested"
    });

    assertSubmitNotNext();

    wrapper.instance().handleChange({
      confirmTeacherconDate: "Yes"
    });

    assertNextNotSubmit();

    wrapper.instance().handleChange({
      confirmTrainingDate: "No"
    });

    assertSubmitNotNext();
  });

  it('on error, navigates to the earliest page with an error', function () {
    const wrapper = mount(
      <FacilitatorProgramRegistration
        {...DEFAULTS}
      />
    );

    const pageErrors = {
      'confirmTrainingDate': 0,
      'addressStreet': 1,
      'liabilityWaiver': 3,
      'gender': 4,
    };

    Object.keys(pageErrors).forEach(error => {
      wrapper.setState({
        errors: []
      });
      wrapper.setState({
        errors: [error]
      });
      assert.equal(wrapper.state('currentPage'), pageErrors[error]);
    });
  });

  it('shows error feedback exactly when appropriate', function () {
    const wrapper = mount(
      <FacilitatorProgramRegistration
        {...DEFAULTS}
      />
    );

    wrapper.setState({
      errors: ['liabilityWaiver'],
      errorHeader: "test error header"
    });

    // only this field should have an error, and only this page should show
    // error header
    assert.isTrue(wrapper.find('#liabilityWaiver').hasClass('has-error'));
    assert.lengthOf(wrapper.find(".alert.alert-danger"), 1);

    wrapper.setState({
      currentPage: 4
    });

    // no fields on this page should have errors, and the error header should
    // not be visible
    assert.lengthOf(wrapper.find('.has-error'), 0);
    assert.lengthOf(wrapper.find(".alert.alert-danger"), 0);

    wrapper.setState({
      globalError: true
    });

    // globally-visible errors should be visible no matter what page we're on
    assert.lengthOf(wrapper.find(".alert.alert-danger"), 1);
  });

  it('correctly displays dynamic fields', function () {
    const wrapper = mount(
      <FacilitatorProgramRegistration
        {...DEFAULTS}
      />
    );

    // Dietary Needs

    wrapper.setState({
      currentPage: 1
    });
    assert.lengthOf(wrapper.find('#dietaryNeedsNotes'), 0);

    wrapper.instance().handleChange({
      dietaryNeeds: ["Other"]
    });
    assert.lengthOf(wrapper.find('#dietaryNeedsNotes'), 1);

    wrapper.instance().handleChange({
      dietaryNeeds: ["Food allergy"]
    });
    assert.lengthOf(wrapper.find('#dietaryNeedsNotes'), 1);

    wrapper.instance().handleChange({
      dietaryNeeds: ["None"]
    });
    assert.lengthOf(wrapper.find('#dietaryNeedsNotes'), 0);

    // CS Years Taught

    wrapper.setState({
      currentPage: 4
    });
    assert.lengthOf(wrapper.find('#csYearsTaught'), 0);

    wrapper.instance().handleChange({
      subjectsTaught: ["Computer Science"]
    });
    assert.lengthOf(wrapper.find('#csYearsTaught'), 1);
  });

  it('validates required fields', function () {
    const wrapper = mount(
      <FacilitatorProgramRegistration
        {...DEFAULTS}
      />
    );

    wrapper.setState({
      currentPage: 1
    });

    assert.lengthOf(wrapper.state('errors'), 0);

    let valid = wrapper.instance().validateCurrentPageRequiredFields();
    assert.isFalse(valid);
    assert.deepEqual(wrapper.state('errors'), [
      'addressStreet',
      'addressCity',
      'addressState',
      'addressZip',
      'contactName',
      'contactRelationship',
      'contactPhone',
      'dietaryNeeds',
      'liveFarAway',
      'howTraveling',
      'needHotel',
      'needAda'
    ]);
  });
});
