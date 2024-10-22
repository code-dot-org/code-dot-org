import {assert, expect} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import jQuery from 'jquery';
import {pick, omit} from 'lodash';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import EnrollForm from '@cdo/apps/code-studio/pd/workshop_enrollment/enroll_form';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

const refute = p => assert.isNotOk(p);

describe('Enroll Form', () => {
  // We aren't testing server responses, but have a fake server to handle calls and suppress warnings
  let server;
  let enrollForm;
  beforeEach(() => {
    server = sinon.fakeServer.create();
    sinon.spy(jQuery, 'ajax');
  });
  afterEach(() => {
    server.restore();
    jQuery.ajax.restore();
  });

  const props = {
    user_id: 1,
    workshop_id: 1,
    first_name: 'Rubeus',
    email: 'rhagrid@hogwarts.edu',
    previous_courses: ['Transfiguration', 'Potions', 'Herbology'],
    workshop_course: 'CS Fundamentals',
    onSubmissionComplete: () => {},
  };

  const school_id = '60001411118';
  const school_info = {
    school_id: school_id,
    school_name: 'Summit Leadership Academy High Desert',
    school_state: 'CA',
    school_type: 'charter',
    school_zip: '92345',
  };

  const baseParams = {
    user_id: 1,
    first_name: 'Rubeus',
    last_name: 'Hagrid',
    email: props.email,
    school_info: school_info,
  };

  const extraParams = {
    role: 'Classroom Teacher',
    grades_teaching: ['Pre-K'],
    csf_intro_intent: 'Yes',
    attended_csf_intro_workshop: 'Yes',
    years_teaching: '10',
    years_teaching_cs: '5',
    taught_ap_before: 'Yes',
    planning_to_teach_ap: 'Yes',
  };

  const renderDefault = (overrides = {}) =>
    shallow(<EnrollForm {...props} {...overrides} />);

  const testValidateFields = (params, errorProperty) => {
    enrollForm = renderDefault(params);
    enrollForm.find('#submit').simulate('click');

    // validationState was previously set as a prop on react-select component controlling role
    // after ts conversion it's clear that prop is invalid
    if (errorProperty !== 'role') {
      const validationState = enrollForm
        .find(`#${errorProperty}`)
        .prop('validationState');
      expect(validationState).to.equal('error');
    }
    expect(jQuery.ajax.called).to.be.false;
  };

  const testSuccessfulSubmit = params => {
    enrollForm = renderDefault(params);

    enrollForm.find('#submit').simulate('click');
    const errorElements = enrollForm.findWhere(
      node => node.prop('validationState') === 'error'
    );

    expect(errorElements).to.have.lengthOf(0);
    expect(jQuery.ajax.called).to.be.true;
  };

  describe('CSF Enroll Form', () => {
    const extraRequiredParams = ['role', 'grades_teaching'];
    const requiredParams = {
      ...baseParams,
      ...pick(extraParams, extraRequiredParams),
    };
    beforeEach(() => {
      enrollForm = renderDefault();
    });

    it('displays role question and grade question', () => {
      assert(enrollForm.exists('#role'));
      assert(enrollForm.exists('#grades_teaching'));
    });

    it('displays describe role question after other/admin role answer', () => {
      enrollForm.find('#role').prop('onChange')({value: 'Other'});
      assert(enrollForm.exists('#describe_role'));
    });

    it("doesn't display describe role question after normal teaching role answer", () => {
      enrollForm.find('#role').prop('onChange')({
        value: 'Librarian',
      });
      refute(enrollForm.exists('#describe_role'));
    });

    extraRequiredParams.forEach(requiredParam => {
      it(`does not submit when ${requiredParam} is missing`, () => {
        testValidateFields(omit(requiredParams, requiredParam), requiredParam);
      });
    });

    it('submits when all required params are present', () => {
      testSuccessfulSubmit(requiredParams);
    });
  });

  describe('CSF Intro Enroll Form', () => {
    const extraRequiredParams = ['role', 'grades_teaching', 'csf_intro_intent'];
    const requiredParams = {
      ...baseParams,
      ...pick(extraParams, extraRequiredParams),
    };
    const overrides = {
      workshop_subject: SubjectNames.SUBJECT_CSF_101,
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    it('displays intent question', () => {
      assert(enrollForm.exists({groupName: 'csf_intro_intent'}));
    });

    it('displays other factors question', () => {
      assert(enrollForm.exists({groupName: 'csf_intro_other_factors'}));
    });

    extraRequiredParams.forEach(requiredParam => {
      it(`does not submit when ${requiredParam} is missing`, () => {
        testValidateFields(
          {...omit(requiredParams, requiredParam), ...overrides},
          requiredParam
        );
      });
    });

    it('submits when all required params are present', () => {
      testSuccessfulSubmit({...requiredParams, ...overrides});
    });
  });

  describe('CSF District Enroll Form', () => {
    const extraRequiredParams = ['role', 'grades_teaching', 'csf_intro_intent'];
    const requiredParams = {
      ...baseParams,
      ...pick(extraParams, extraRequiredParams),
    };
    const overrides = {
      workshop_subject: SubjectNames.SUBJECT_CSF_DISTRICT,
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    it('displays intent question', () => {
      assert(enrollForm.exists({groupName: 'csf_intro_intent'}));
    });

    it('displays other factors question', () => {
      assert(enrollForm.exists({groupName: 'csf_intro_other_factors'}));
    });

    extraRequiredParams.forEach(requiredParam => {
      it(`does not submit when ${requiredParam} is missing`, () => {
        testValidateFields(
          {...omit(requiredParams, requiredParam), ...overrides},
          requiredParam
        );
      });
    });

    it('submits when all required params are present', () => {
      testSuccessfulSubmit({...requiredParams, ...overrides});
    });
  });

  describe('CSF Deep Dive Enroll Form', () => {
    const extraRequiredParams = [
      'role',
      'grades_teaching',
      'attended_csf_intro_workshop',
    ];
    const requiredParams = {
      ...baseParams,
      ...pick(extraParams, extraRequiredParams),
    };
    const overrides = {
      workshop_subject: SubjectNames.SUBJECT_CSF_201,
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    it('does not display intent question', () => {
      refute(enrollForm.exists({groupName: 'csf_intro_intent'}));
    });

    it('does not display other factors question', () => {
      refute(enrollForm.exists({groupName: 'csf_intro_other_factors'}));
    });

    extraRequiredParams.forEach(requiredParam => {
      it(`does not submit when ${requiredParam} is missing`, () => {
        testValidateFields(
          {...omit(requiredParams, requiredParam), ...overrides},
          requiredParam
        );
      });
    });

    it('submits when all required params are present', () => {
      testSuccessfulSubmit({...requiredParams, ...overrides});
    });
  });

  describe('CSP Enroll Form', () => {
    const requiredParams = {
      ...baseParams,
    };
    const overrides = {
      workshop_course: 'CS Principles',
      collect_demographics: false,
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    it('does not display role question', () => {
      refute(enrollForm.exists('#role'));
    });

    it('does not display previous courses question', () => {
      refute(enrollForm.exists('#previous_courses'));
    });

    it('does not display intent question', () => {
      refute(enrollForm.exists({groupName: 'csf_intro_intent'}));
    });

    it('does not display other factors question', () => {
      refute(enrollForm.exists({groupName: 'csf_intro_other_factors'}));
    });

    it('submits when all required params are present', () => {
      testSuccessfulSubmit({...requiredParams, ...overrides});
    });
  });

  describe('CSP Enroll Form with demographics', () => {
    const overrides = {
      workshop_course: 'CS Principles',
      collect_demographics: true,
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    it('does display previous courses question', () => {
      assert(enrollForm.exists('#previous_courses'));
    });

    it('submits when all required params are present', () => {
      testSuccessfulSubmit({...baseParams, ...overrides});
    });
  });

  describe('CSP Returning Teachers Form', () => {
    const extraRequiredParams = [
      'years_teaching',
      'years_teaching_cs',
      'taught_ap_before',
      'planning_to_teach_ap',
    ];
    const requiredParams = {
      ...baseParams,
      ...pick(extraParams, extraRequiredParams),
    };
    const overrides = {
      workshop_course: 'CS Principles',
      workshop_subject: SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS,
      collect_demographics: false,
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    ['years_teaching', 'years_teaching_cs'].forEach(question => {
      it('displays questions specific to this workshop type', () => {
        assert(enrollForm.exists('#' + question));
      });
    });

    ['taught_ap_before', 'planning_to_teach_ap'].forEach(question => {
      it('displays questions specific to this workshop type', () => {
        assert(enrollForm.exists({groupName: question}));
      });
    });

    ['role', 'previous_courses'].forEach(question => {
      it('displays questions not relevant for this workshop type', () => {
        refute(enrollForm.exists('#' + question));
      });
    });

    ['csf_intro_intent', 'csf_intro_other_factors'].forEach(question => {
      it('displays questions not relevant for this workshop type', () => {
        refute(enrollForm.exists({groupName: question}));
      });
    });

    extraRequiredParams.forEach(requiredParam => {
      it(`does not submit when ${requiredParam} is missing`, () => {
        testValidateFields(
          {...omit(requiredParams, requiredParam), ...overrides},
          requiredParam
        );
      });
    });

    it('submits when all required params are present', () => {
      testSuccessfulSubmit({...requiredParams, ...overrides});
    });
  });

  describe('Admin/Counselor Enroll Form', () => {
    const overrides = {
      workshop_course: 'Admin/Counselor Workshop',
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    it('displays role question', () => {
      assert(enrollForm.exists('#role'));
    });

    it('does not display grades_teaching question', () => {
      assert(!enrollForm.exists('#grades_teaching'));
    });

    it('displays describe role question after answered as other', () => {
      enrollForm.find('#role').prop('onChange')({value: 'Other'});
      expect(enrollForm.find('#describe_role')).to.have.length(1);
    });

    it('does not display describe role question after answered as counselor or admin', () => {
      enrollForm.find('#role').prop('onChange')({
        value: 'Administrator',
      });
      expect(enrollForm.find('#describe_role')).to.have.length(0);

      enrollForm.find('#role').prop('onChange')({
        value: 'Counselor',
      });
      expect(enrollForm.find('#describe_role')).to.have.length(0);
    });

    it('submits when all required params are present', () => {
      testSuccessfulSubmit({...baseParams, ...overrides});
    });
  });

  describe('All Enroll Forms', () => {
    const requiredParams = {
      ...baseParams,
      ...pick(extraParams, ['role', 'grades_teaching']),
    };
    beforeEach(() => {
      enrollForm = renderDefault();
    });

    it.skip('submit other school_info fields when no school_id', () => {
      const school_info_without_id = {
        school_name: 'Hogwarts School of Witchcraft and Wizardry',
        school_state: 'Washington',
        school_zip: '12345',
        school_type: 'Private school',
      };
      const expectedSchoolInfo = {
        ...school_info_without_id,
        school_type: 'private',
      };
      let expectedData = {...requiredParams, school_info: expectedSchoolInfo};
      enrollForm.setState({
        ...requiredParams,
        school_info: school_info_without_id,
      });

      enrollForm.find('#submit').simulate('click');

      expect(jQuery.ajax.calledOnce).to.be.true;
      expect(JSON.parse(jQuery.ajax.getCall(0).args[0].data)).to.deep.equal(
        expectedData
      );
    });

    it.skip('do not submit other school_info fields when school_id is selected', () => {
      enrollForm.setState(requiredParams);
      enrollForm.find('#submit').simulate('click');

      expect(jQuery.ajax.calledOnce).to.be.true;
      expect(JSON.parse(jQuery.ajax.getCall(0).args[0].data)).to.deep.equal({
        ...requiredParams,
        school_info: {school_id: school_id},
      });
    });

    it('disable submit button after submit', () => {
      enrollForm = renderDefault({
        ...baseParams,
        grades_teaching: extraParams.grades_teaching,
      });
      // Submit button should stay enabled if invalid data was provided.
      // In this case, no "role" was included, which is a required field.
      expect(enrollForm.find('#submit').prop('disabled')).to.be.false;
      enrollForm.find('#submit').simulate('click');
      expect(enrollForm.find('#submit').prop('disabled')).to.be.false;

      // Submit button becomes disabled once legitimate submission is made.
      enrollForm.find('#role').prop('onChange')({
        value: 'Librarian',
      });
      enrollForm.find('#submit').simulate('click');
      expect(enrollForm.find('#submit').prop('disabled')).to.be.true;
    });

    it('set first name when rendered as a student', () => {
      // Sometimes a teacher has a student account and fills out this
      // form.  That's fine; they'll be upgraded to a teacher account
      // later.
      // In the initial state for a student account, we pass a first_name
      // prop but never an email prop, which caused a bug in the past.
      enrollForm = renderDefault({email: '', first_name: 'Student'});

      expect(enrollForm.find('#email').prop('defaultValue')).to.equal('');
      expect(enrollForm.find('#first_name').prop('defaultValue')).to.equal(
        'Student'
      );

      // If I submit in this state, first name should not be one
      // of the validation errors.
      enrollForm.find('#submit').simulate('click');
      expect(jQuery.ajax.called).to.be.false;
      expect(enrollForm.find('#email').prop('validationState')).to.equal(
        'error'
      );
      expect(enrollForm.find('#first_name').prop('validationState')).to.be.null;
    });

    // first name and email fields are set as props on page load
    // the user needs to explicitly set them blank for errors to appear
    ['first_name', 'email'].forEach(param => {
      it(`do not submit when user sets blank ${param}`, () => {
        testValidateFields({...requiredParams, [param]: ''}, param);
      });
    });

    ['last_name', 'school_info'].forEach(param => {
      // TODO: skipped school_info test due to upcoming refactor. add this test back in after
      if (param === 'last_name') {
        it(`do not submit when user does not input ${param}`, () => {
          testValidateFields(
            omit(requiredParams, param),
            param === 'school_info' ? 'school_id' : param
          );
        });
      }
    });
  });
});
