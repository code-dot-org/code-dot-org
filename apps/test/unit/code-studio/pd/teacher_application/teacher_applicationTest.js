import React from 'react';
import _ from 'lodash';
import sinon from 'sinon';
import {expect} from 'chai';
import {TeacherApplication, likertAnswers} from '@cdo/apps/code-studio/pd/teacher_application/teacher_application';
import {shallow} from 'enzyme';
import ButtonList from '@cdo/apps/code-studio/pd/form_components/button_list';

describe("Tests for Teacher Application", () => {
  let form;
  let districtErrorMessage;
  const districtErrorMessageHandler = function (message) { districtErrorMessage = message;};
  const regionalPartnerExample = {regionalPartnerGroup: 1, regionalPartnerName: 'A+ College Ready'};
  const regionalPartnerWithWorkshopDates = {regionalPartnerGroup: 1, regionalPartnerName: 'A+ College Ready', workshopDays: 'OverriddenDates'};

  //<editor-fold desc="sample data">
  const warningFields = ['regionalPartnersOnlyWarning', 'identifyingRegionalPartnerWarning'];
  const workshopNamePlaceholder = '2017 Workshop (exact date to be determined)';
  const defaultSchoolDistrictData = {
    ['us-or-international']: 'us',
    ['school-type']: '',
    ['school-state']: '',
    ['school-district']: '',
    ['school-district-other']: false,
    ['school']: '',
    ['school-other']: false,
    ['school-district-name']: '',
    ['school-name']: '',
    ['school-zipcode']: ''
  };

  const privateSchoolData = Object.assign({}, defaultSchoolDistrictData, {
    ['school-type']: 'private',
    ['school-state']: 'CA',
    ['school-name']: 'Milford Academy',
    ['school-zipcode']: '10000'
  });

  const publicSchoolData = Object.assign({}, defaultSchoolDistrictData, {
    ['school-type']: 'public',
    ['school-state']: 'NY',
    ['school-district']: '123456',
    ['school']: 'Williamsville High School',
  });

  const customPublicSchoolData = Object.assign({}, defaultSchoolDistrictData, {
    ['school-type']: 'public',
    ['school-state']: 'NY',
    ['school-district-other']: true,
    ['school-district-name']: 'Some undocumented public school',
    ['school-name']: 'Stealthy school',
    ['school-zipcode']: '10000'
  });

  const defaultUser = {
    textFields: {
      firstName: 'Benjamin',
      preferredFirstName: 'Ben',
      lastName: 'Franklin',
      primaryEmail: 'ben@upenn.edu',
      secondaryEmail: 'ben@gmail.com',
      phoneNumber: '2127365000',
      principalFirstName: 'George',
      principalLastName: 'Washington',
      principalEmail: 'washington@whitehouse.gov',
      principalPrefix: 'Dr.'
    },
    selectionFields: {
      gradesAtSchool: ['Kindergarten'].concat(_.map(_.range(1,13), x => x.toString())),
      genderIdentity: 'Male',
      grades2016: ['9', '10', '11', '12'],
      subjects2016: ['Computer Science', 'Math', 'History'],
      grades2017: ['8', '9', '10', '11', '12'],
      subjects2017: ['Computer Science', 'Math', 'History', 'Business'],
    }
  };

  function likertValueOf(answer) {
    return (likertAnswers.indexOf(answer) + 1).toString();
  }

  const defaultSurveyFields = {
    selectionFields: {
      currentCsOpportunities: ['After school clubs', 'Hour of Code']
    },
    textFields: {
      whyCsIsImportant: 'Because all life is pain, and anyone who says otherwise is selling you something.',
      whatTeachingSteps: 'Sharks with frickin\' laser beams'
    },
    likertList: {
      allStudentsShouldLearn: likertValueOf('Strongly Agree'),
      allStudentsCanLearn: likertValueOf('Strongly Agree'),
      newApproaches: likertValueOf('Strongly Agree'),
      allAboutContent: likertValueOf('Disagree'),
      allAboutProgramming: likertValueOf('Disagree'),
      csCreativity: likertValueOf('Strongly Agree'),
    },
    summerProgramFields: {
      committedToSummer: 'Yes',
      ableToAttendAssignedSummerWorkshop: 'Yes'
    }
  };

  const defaultCsdFields = {
    selectedCourse: {
      selectedCourse: 'csd'
    },
    selectionFields: {
      gradesPlanningToTeach: ['6', '7', '8'],
    },
  };

  const defaultCspFields = {
    selectedCourse: {
      selectedCourse: 'csp'
    },
    selectionFields: {
      cspDuration: 'Year-long course (~180 contact hours)',
      cspApCourse: 'AP course only',
      gradesPlanningToTeach: ['9', '10'],
      cspApExamIntent: 'Yes'
    }
  };
  //</editor-fold>

  const write = (label, value) => {
    const field = form.find(`#${label}`);

    field.simulate('change', {target: {id: field.prop('id'), value}});
    expect(form.state(label)).to.equal(value);
  };

  const check = (groupName, values, parentElement = form) => {
    const buttonList = parentElement.find(`[groupName="${groupName}"]`);
    expect(buttonList.is('ButtonList')).to.be.true;

    if (Array.isArray(values)) {
      expect(buttonList.prop('type')).to.equal('check');
      values.forEach(value => {
        expect(buttonList.prop('answers')).to.contain(value);
      });
    } else {
      expect(buttonList.prop('type')).to.equal('radio');
      expect(buttonList.prop('answers')).to.contain(values);
    }

    buttonList.simulate('change', {[buttonList.prop('groupName')]: values});
    expect(form.state(groupName)).to.equal(values);
  };

  const pickLikert = (name, value) => {
    const likertButton = form.find(`[name="${name}"]`).at(value - 1);
    expect(likertButton.prop('value')).to.equal(parseInt(value));
    likertButton.simulate('change', {target: {name: name, value: value.toString()}});
    expect(form.state(name)).to.equal(value.toString());
  };

  const pickCourse = (course) => {
    const buttonList = form.find(`[value="${course}"]`);
    buttonList.simulate('change', {target: {name: 'selectedCourse', value: course}});
  };

  const assertNoFormErrors = () => {
    expect(form.instance().errorData).to.deep.equal({});
  };

  const completeApplication = (application, workshopString) => {
    _.forEach(application['textFields'], (value, label) => {
      write(label, value);
    });
    _.forEach(application['selectionFields'], (values, groupName) => {
      check(groupName, values);
    });
    _.forEach(application['likertList'], (value, name) => {
      pickLikert(name, value);
    });

    let summerProgramContent = form.find('SummerProgramContent');
    expect(summerProgramContent.prop('selectedWorkshop')).to.equal(workshopString);

    summerProgramContent = summerProgramContent.shallow();
    _.forEach(application['summerProgramFields'], (value, name) => {
      check(name, value, summerProgramContent);
    });

    let button = form.find('Button').filter({children: 'Complete and Send'});
    button.simulate('click');
  };

  const createTeacherApplication = (schoolDistrictData, regionalPartnerInformation = []) => {
    return shallow(
      <TeacherApplication
        schoolDistrictData={schoolDistrictData}
        districtErrorMessageHandler={districtErrorMessageHandler}
        {...regionalPartnerInformation}
      />
    );
  };

  const assertSummerContentAndWarningExistance = (summerContentExpected, expectedWarningElementId) => {
    expect(form.find('SummerProgramContent').isEmpty()).to.equal(!summerContentExpected);
    expectedWarningElementId && expect(form.find(`#${expectedWarningElementId}`)).to.have.length(1);
    warningFields.forEach((field) => {
      (expectedWarningElementId !== field) && expect(form.find(`#${field}`).isEmpty()).to.be.true;
    });
  };

  describe("Tests related to initial page state for given school district data", () => {
    it("initial state of the page contains no errors", () => {
      form = createTeacherApplication(defaultSchoolDistrictData);

      assertNoFormErrors();
      assertSummerContentAndWarningExistance();
    });

    it("Regional Partners Only warning shows up if private or other is selected for school type", () => {
      for (var schoolType of ['private', 'other']) {
        privateSchoolData['school-type'] = schoolType;

        form = createTeacherApplication(privateSchoolData);

        assertNoFormErrors();
        assertSummerContentAndWarningExistance(false, 'regionalPartnersOnlyWarning');
      }
    });

    it("IDing regional partner warning shows up if other district is checked", () => {
      form = createTeacherApplication(customPublicSchoolData);

      assertNoFormErrors();
      assertSummerContentAndWarningExistance(false, 'identifyingRegionalPartnerWarning');
    });

    it("IDing regional partner warning shows up if we have no regional partner", () => {
      form = createTeacherApplication(publicSchoolData);

      assertNoFormErrors();
      assertSummerContentAndWarningExistance(false, 'identifyingRegionalPartnerWarning');
    });

    it("No warning shows up for data where we have a regional partner", () => {
      form = createTeacherApplication(publicSchoolData, regionalPartnerExample);

      assertNoFormErrors();
      assertSummerContentAndWarningExistance(false);
    });

    it("Workshop days overrides works as expected", () => {
      form = createTeacherApplication(publicSchoolData, regionalPartnerWithWorkshopDates);

      pickCourse('csd');
      assertNoFormErrors();
      assertSummerContentAndWarningExistance(true);
      expect(form.find('SummerProgramContent').prop('selectedWorkshop')).to.equal('OverriddenDates');
    });
  });

  describe("Tests for completed applications", () => {
    let server;

    before(() => {
      server = sinon.fakeServer.create();
      server.respondWith("OK");
    });

    after(() => {
      server.restore();
    });

    it("Completed CSD applications for public schools get submitted without errors", () => {
      form = createTeacherApplication(publicSchoolData, regionalPartnerExample);

      pickCourse('csd');
      let application = _.merge({}, defaultUser, defaultSurveyFields, defaultCsdFields);
      completeApplication(application, 'July 30 - August 4, 2017: Philadelphia (travel expenses paid)');

      assertNoFormErrors();
      assertSummerContentAndWarningExistance(true);
      expect(form.state()).to.deep.equal(Object.assign({}, {submitting: true}, ...Object.values(application)));
    });

    it("Completed CSP applications for public schools get submitted without errors", () => {
      form = createTeacherApplication(publicSchoolData, regionalPartnerExample);

      pickCourse('csp');
      let application = _.merge({}, defaultUser, defaultSurveyFields, defaultCspFields);
      completeApplication(application, 'A+ College Ready: June 26 - 30, 2017');

      assertNoFormErrors();
      assertSummerContentAndWarningExistance(true);
      expect(form.state()).to.deep.equal(Object.assign({}, {submitting: true}, ...Object.values(application)));
    });

    it("Completed CSD applications for private schools get submitted without errors", () => {
      form = createTeacherApplication(privateSchoolData);

      pickCourse('csd');
      let application = _.merge({}, defaultUser, defaultSurveyFields, defaultCsdFields);
      delete application['summerProgramFields']['ableToAttendAssignedSummerWorkshop'];
      completeApplication(application, '2017 Workshop (exact date to be determined)');

      assertNoFormErrors();
      assertSummerContentAndWarningExistance(true, 'regionalPartnersOnlyWarning');
      expect(form.state()).to.deep.equal(Object.assign({}, {submitting: true}, ...Object.values(application)));
    });

    it("IDing regional partner warning shows up if other district is checked", () => {
      form = createTeacherApplication(customPublicSchoolData);

      pickCourse('csd');
      let application = _.merge({}, defaultUser, defaultSurveyFields, defaultCsdFields);
      delete application['summerProgramFields']['ableToAttendAssignedSummerWorkshop'];

      completeApplication(application, workshopNamePlaceholder);

      assertNoFormErrors();
      assertSummerContentAndWarningExistance(true, 'identifyingRegionalPartnerWarning');
      expect(form.state()).to.deep.equal(Object.assign({}, {submitting: true}, ...Object.values(application)));
    });

    it("IDing regional partner warning shows up if we have no regional partner", () => {
      form = createTeacherApplication(publicSchoolData);

      pickCourse('csd');
      let application = _.merge({}, defaultUser, defaultSurveyFields, defaultCsdFields);
      delete application['summerProgramFields']['ableToAttendAssignedSummerWorkshop'];

      completeApplication(application, workshopNamePlaceholder);

      assertNoFormErrors();
      assertSummerContentAndWarningExistance(true, 'identifyingRegionalPartnerWarning');
      expect(form.state()).to.deep.equal(Object.assign({}, {submitting: true}, ...Object.values(application)));
    });
  });

  describe("Tests for expected failure cases", () => {
    it("Applications missing required data are not submitted", () => {
      form = createTeacherApplication(publicSchoolData, regionalPartnerExample);

      pickCourse('csd');
      let application = _.merge({}, defaultUser, defaultSurveyFields, defaultCsdFields);
      delete application['textFields']['firstName'];

      completeApplication(application, 'July 30 - August 4, 2017: Philadelphia (travel expenses paid)');
      expect(form.state('submitting')).to.be.false;
      expect(form.find('#firstName').prop('errorText')).to.equal('This field is required');
    });

    it("Applications with missing likert answers are not submitted", () => {
      form = createTeacherApplication(publicSchoolData, regionalPartnerExample);

      pickCourse('csd');
      let application = _.merge({}, defaultUser, defaultSurveyFields, defaultCsdFields);
      delete application['likertList']['csCreativity'];
      completeApplication(application, 'July 30 - August 4, 2017: Philadelphia (travel expenses paid)');
      expect(form.state('submitting')).to.be.false;
      expect(form.find('#csCreativity').prop('validationState')).to.equal('error');
    });

    it("Applications with missing survey answers are not submitted", () => {
      form = createTeacherApplication(publicSchoolData, regionalPartnerExample);

      pickCourse('csd');
      let application = _.merge({}, defaultUser, defaultSurveyFields, defaultCsdFields);
      delete application['selectionFields']['currentCsOpportunities'];
      completeApplication(application, 'July 30 - August 4, 2017: Philadelphia (travel expenses paid)');
      expect(form.state('submitting')).to.be.false;
      expect(form.find('[groupName="currentCsOpportunities"]').prop('validationState')).to.equal('error');
    });

    it("Applications with non emails in email fields are not submitted", () => {
      form = createTeacherApplication(publicSchoolData, regionalPartnerExample);

      pickCourse('csd');
      let application = _.merge({}, defaultUser, defaultSurveyFields, defaultCsdFields);
      application['textFields']['primaryEmail'] = 'not an email';

      completeApplication(application, 'July 30 - August 4, 2017: Philadelphia (travel expenses paid)');
      expect(form.state('submitting')).to.be.false;
      expect(form.find('#primaryEmail').prop('errorText')).to.equal(
        'Please enter a valid email address, like name@example.com');
    });

    it("Applications with non phone numbers in phone number fields are not submitted", () => {
      form = createTeacherApplication(publicSchoolData, regionalPartnerExample);

      pickCourse('csd');
      let application = _.merge({}, defaultUser, defaultSurveyFields, defaultCsdFields);
      application['textFields']['phoneNumber'] = 'not a number';

      completeApplication(application, 'July 30 - August 4, 2017: Philadelphia (travel expenses paid)');
      expect(form.state('submitting')).to.be.false;
      expect(form.find('#phoneNumber').prop('errorText')).to.equal(
        'Phone numbers must have at least 10 digits, like (123) 456-7890');
    });
  });
});
