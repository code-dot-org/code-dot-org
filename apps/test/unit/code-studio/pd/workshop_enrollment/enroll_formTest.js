import {assert, expect} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import {pick} from 'lodash';
import React from 'react';
import {act} from 'react-dom/test-utils';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import EnrollForm from '@cdo/apps/code-studio/pd/workshop_enrollment/enroll_form';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import * as useSchoolInfoModule from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import * as getAuthenticityTokenModule from '@cdo/apps/util/AuthenticityTokenStore';
import {NonSchoolOptions} from '@cdo/generated-scripts/sharedConstants';

const refute = p => assert.isNotOk(p);

describe('Enroll Form', () => {
  let enrollForm;
  let fetchStub;
  let useSchoolInfoStub;
  let getAuthenticityTokenStub;
  let restOfUseSchoolInfo = {
    usIp: true,
    setSchoolId: sinon.spy(),
    setCountry: sinon.spy(),
    setSchoolName: sinon.spy(),
    setSchoolZip: sinon.spy(),
    reset: sinon.spy(),
  };

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
    getAuthenticityTokenStub = sinon
      .stub(getAuthenticityTokenModule, 'getAuthenticityToken')
      .resolves('');
    useSchoolInfoStub = sinon
      .stub(useSchoolInfoModule, 'useSchoolInfo')
      .returns({
        country: school_info.country,
        schoolId: school_info.school_id,
        schoolZip: school_info.school_zip,
        schoolName: '',
        schoolsList: [{value: school_id, text: school_info.school_name}],
        ...restOfUseSchoolInfo,
      });
  });
  afterEach(() => {
    fetchStub.restore();
    getAuthenticityTokenStub.restore();
    useSchoolInfoStub.restore();
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
    country: 'US',
    school_id: school_id,
    school_name: 'Summit Leadership Academy High Desert',
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

  const getLabelSelector = key => `Label[htmlFor="${key}"]`;
  const getIdSelector = key => `#${key}`;

  const testValidateFields = (params, selector) => {
    enrollForm = renderDefault(params);
    enrollForm.find(getIdSelector('submit')).simulate('click');
    const error = enrollForm.find(selector).prop('errorMessage');
    expect(error).to.be.defined;
    expect(fetchStub.called).to.be.false;
  };

  const testSuccessfulSubmit = async params => {
    enrollForm = renderDefault(params);
    await act(async () => {
      enrollForm.find(getIdSelector('submit')).simulate('click');
    });
    const errorElements = enrollForm.findWhere(
      node => node.prop('errorMessage') !== undefined
    );

    expect(errorElements).to.have.lengthOf(0);
    expect(fetchStub.called).to.be.true;
  };

  describe('CSF Enroll Form', () => {
    const extraRequiredParams = [
      ['role', getIdSelector('role')],
      ['grades_teaching', getLabelSelector('grades_teaching')],
    ];
    const requiredParams = {
      ...baseParams,
      ...pick(
        extraParams,
        extraRequiredParams.map(([key]) => key)
      ),
    };
    beforeEach(() => {
      enrollForm = renderDefault();
    });

    it('displays role question and grade question', () => {
      assert(enrollForm.exists(getIdSelector('role')));
      assert(enrollForm.exists(getLabelSelector('grades_teaching')));
    });

    it('displays describe role question after other/admin role answer', () => {
      enrollForm.find(getIdSelector('role')).prop('onChange')({
        target: {value: 'Other'},
      });
      assert(enrollForm.exists(getIdSelector('describe_role')));
    });

    it("doesn't display describe role question after normal teaching role answer", () => {
      enrollForm.find(getIdSelector('role')).prop('onChange')({
        target: {value: 'Librarian'},
      });
      refute(enrollForm.exists(getIdSelector('describe_role')));
    });

    extraRequiredParams.forEach(([requiredParam, selector]) => {
      it(`does not submit when ${requiredParam} is missing`, () => {
        testValidateFields(
          {...requiredParams, [requiredParam]: undefined},
          selector
        );
      });
    });

    it('submits when all required params are present', async () => {
      await testSuccessfulSubmit(requiredParams);
    });
  });

  describe('CSF Intro Enroll Form', () => {
    const extraRequiredParams = [
      ['role', getIdSelector('role')],
      ['grades_teaching', getLabelSelector('grades_teaching')],
      ['csf_intro_intent', getLabelSelector('csf_intro_intent')],
    ];
    const requiredParams = {
      ...baseParams,
      ...pick(
        extraParams,
        extraRequiredParams.map(([key]) => key)
      ),
    };
    const overrides = {
      workshop_subject: SubjectNames.SUBJECT_CSF_101,
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    it('displays intent question', () => {
      assert(enrollForm.exists(getLabelSelector('csf_intro_intent')));
    });

    it('displays other factors question', () => {
      assert(enrollForm.exists(getLabelSelector('csf_intro_other_factors')));
    });

    extraRequiredParams.forEach(([requiredParam, selector]) => {
      it(`does not submit when ${requiredParam} is missing`, () => {
        testValidateFields(
          {...requiredParams, [requiredParam]: undefined, ...overrides},
          selector
        );
      });
    });

    it('submits when all required params are present', async () => {
      await testSuccessfulSubmit({...requiredParams, ...overrides});
    });
  });

  describe('CSF District Enroll Form', () => {
    const extraRequiredParams = [
      ['role', getIdSelector('role')],
      ['grades_teaching', getLabelSelector('grades_teaching')],
      ['csf_intro_intent', getLabelSelector('csf_intro_intent')],
    ];
    const requiredParams = {
      ...baseParams,
      ...pick(
        extraParams,
        extraRequiredParams.map(([key]) => key)
      ),
    };
    const overrides = {
      workshop_subject: SubjectNames.SUBJECT_CSF_DISTRICT,
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    it('displays intent question', () => {
      assert(enrollForm.exists(getLabelSelector('csf_intro_intent')));
    });

    it('displays other factors question', () => {
      assert(enrollForm.exists(getLabelSelector('csf_intro_other_factors')));
    });

    extraRequiredParams.forEach(([requiredParam, selector]) => {
      it(`does not submit when ${requiredParam} is missing`, () => {
        testValidateFields(
          {...requiredParams, [requiredParam]: undefined, ...overrides},
          selector
        );
      });
    });

    it('submits when all required params are present', async () => {
      await testSuccessfulSubmit({...requiredParams, ...overrides});
    });
  });

  describe('CSF Deep Dive Enroll Form', () => {
    const extraRequiredParams = [
      ['role', getIdSelector('role')],
      ['grades_teaching', getLabelSelector('grades_teaching')],
      ['attended_csf_intro_workshop', getLabelSelector('grades_teaching')],
    ];
    const requiredParams = {
      ...baseParams,
      ...pick(
        extraParams,
        extraRequiredParams.map(([key]) => key)
      ),
    };
    const overrides = {
      workshop_subject: SubjectNames.SUBJECT_CSF_201,
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    it('displays intent question', () => {
      refute(enrollForm.exists(getLabelSelector('csf_intro_intent')));
    });

    it('displays other factors question', () => {
      refute(enrollForm.exists(getLabelSelector('csf_intro_other_factors')));
    });

    extraRequiredParams.forEach(([requiredParam, selector]) => {
      it(`does not submit when ${requiredParam} is missing`, () => {
        testValidateFields(
          {...requiredParams, [requiredParam]: undefined, ...overrides},
          selector
        );
      });
    });

    it('submits when all required params are present', async () => {
      await testSuccessfulSubmit({...requiredParams, ...overrides});
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
      refute(enrollForm.exists(getIdSelector('role')));
    });

    it('does not display previous courses question', () => {
      refute(enrollForm.exists(getLabelSelector('previous_courses')));
    });

    it('displays intent question', () => {
      refute(enrollForm.exists(getLabelSelector('csf_intro_intent')));
    });

    it('displays other factors question', () => {
      refute(enrollForm.exists(getLabelSelector('csf_intro_other_factors')));
    });

    it('submits when all required params are present', async () => {
      await testSuccessfulSubmit({...requiredParams, ...overrides});
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
      assert(enrollForm.exists(getIdSelector('previous_courses')));
    });

    it('submits when all required params are present', async () => {
      await testSuccessfulSubmit({...baseParams, ...overrides});
    });
  });

  describe('CSP Returning Teachers Form', () => {
    const extraRequiredParams = [
      ['years_teaching', getIdSelector('years_teaching')],
      ['years_teaching_cs', getIdSelector('years_teaching_cs')],
      ['taught_ap_before', getLabelSelector('taught_ap_before')],
      ['planning_to_teach_ap', getLabelSelector('planning_to_teach_ap')],
    ];
    const requiredParams = {
      ...baseParams,
      ...pick(
        extraParams,
        extraRequiredParams.map(([key]) => key)
      ),
    };
    const overrides = {
      workshop_course: 'CS Principles',
      workshop_subject: SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS,
      collect_demographics: false,
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    [
      ['years_teaching', getIdSelector('years_teaching')],
      ['years_teaching_cs', getIdSelector('years_teaching_cs')],
      ['taught_ap_before', getLabelSelector('taught_ap_before')],
      ['planning_to_teach_ap', getLabelSelector('planning_to_teach_ap')],
    ].forEach(([key, selector]) => {
      it(`displays ${key} field for returning teachers form`, () => {
        assert(enrollForm.exists(selector));
      });
    });

    [
      ['role', getIdSelector('role')],
      ['previous_courses', getLabelSelector('previous_courses')],
      ['csf_intro_intent', getLabelSelector('csf_intro_intent')],
      ['csf_intro_other_factors', getLabelSelector('csf_intro_other_factors')],
    ].forEach(([key, selector]) => {
      it(`does not display ${key} field for returning teachers form`, () => {
        refute(enrollForm.exists(selector));
      });
    });

    extraRequiredParams.forEach(([requiredParam, selector]) => {
      it(`does not submit when ${requiredParam} is missing`, () => {
        testValidateFields(
          {...requiredParams, [requiredParam]: undefined, ...overrides},
          selector
        );
      });
    });

    it('submits when all required params are present', async () => {
      await testSuccessfulSubmit({...requiredParams, ...overrides});
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
      assert(enrollForm.exists(getIdSelector('role')));
    });

    it('does not display grades_teaching question', () => {
      assert(!enrollForm.exists(getIdSelector('grades_teaching')));
    });

    it('displays describe role question after answered as other', () => {
      enrollForm
        .find(getIdSelector('role'))
        .simulate('change', {target: {value: 'Other'}});
      expect(enrollForm.find(getLabelSelector('describe_role'))).to.have.length(
        1
      );
    });

    it('does not display describe role question after answered as counselor or admin', () => {
      enrollForm.find(getIdSelector('role')).simulate('change', {
        target: {value: 'Administrator'},
      });
      expect(enrollForm.find(getLabelSelector('describe_role'))).to.have.length(
        0
      );

      enrollForm.find(getIdSelector('role')).simulate('change', {
        target: {value: 'Counselor'},
      });
      expect(enrollForm.find(getLabelSelector('describe_role'))).to.have.length(
        0
      );
    });

    it('submits when all required params are present', async () => {
      await testSuccessfulSubmit({...baseParams, ...overrides});
    });
  });

  describe('Build Your Own Workshop Enroll Form', () => {
    const overrides = {
      workshop_course: 'Build Your Own Workshop',
    };
    beforeEach(() => {
      enrollForm = renderDefault(overrides);
    });

    it('does not display form questions', () => {
      assert(!enrollForm.exists('#role'));
      assert(!enrollForm.exists('#grades_teaching'));
      assert(!enrollForm.exists('#describe_role'));

      // Still shows the 'Register' button
      assert(enrollForm.exists('#submit'));
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

    it('submit other school_info fields when no school_id', async () => {
      const school_info_without_id = {
        school_name: 'Hogwarts School of Witchcraft and Wizardry',
        zip: '12345',
        country: 'US',
      };

      useSchoolInfoStub.returns({
        schoolName: 'Hogwarts School of Witchcraft and Wizardry',
        schoolState: 'WA',
        schoolZip: '12345',
        country: 'US',
        schoolId: NonSchoolOptions.CLICK_TO_ADD,
        schoolsList: [],
        ...restOfUseSchoolInfo,
      });

      enrollForm = renderDefault(requiredParams);

      await act(async () => {
        enrollForm.find(getIdSelector('submit')).simulate('click');
      });

      expect(fetchStub.calledOnce).to.be.true;
      expect(
        JSON.parse(fetchStub.getCall(0).args[1].body).school_info
      ).to.deep.equal(school_info_without_id);
    });

    it('do not submit other school_info fields when school_id is selected', async () => {
      enrollForm = renderDefault(requiredParams);
      await act(async () => {
        enrollForm.find(getIdSelector('submit')).simulate('click');
      });

      expect(fetchStub.calledOnce).to.be.true;
      expect(
        JSON.parse(fetchStub.getCall(0).args[1].body).school_info
      ).to.deep.equal({school_id: school_id});
    });

    it('disable submit button after submit', () => {
      enrollForm = renderDefault({
        ...baseParams,
        grades_teaching: extraParams.grades_teaching,
      });
      // Submit button should stay enabled if invalid data was provided.
      // In this case, no "role" was included, which is a required field.
      expect(enrollForm.find(getIdSelector('submit')).prop('disabled')).to.be
        .false;
      enrollForm.find(getIdSelector('submit')).simulate('click');
      expect(enrollForm.find(getIdSelector('submit')).prop('disabled')).to.be
        .false;

      // Submit button becomes disabled once legitimate submission is made.
      enrollForm.find(getIdSelector('role')).simulate('change', {
        target: {value: 'Librarian'},
      });
      enrollForm.find(getIdSelector('submit')).simulate('click');
      expect(enrollForm.find(getIdSelector('submit')).prop('disabled')).to.be
        .true;
    });

    it('set first name when rendered as a student', () => {
      // Sometimes a teacher has a student account and fills out this
      // form.  That's fine; they'll be upgraded to a teacher account
      // later.
      // In the initial state for a student account, we pass a first_name
      // prop but never an email prop, which caused a bug in the past.
      enrollForm = renderDefault({email: '', first_name: 'Student'});

      expect(enrollForm.find(getIdSelector('email')).prop('value')).to.equal(
        ''
      );
      expect(
        enrollForm.find(getIdSelector('first_name')).prop('value')
      ).to.equal('Student');

      // If I submit in this state, first name should not be one
      // of the validation errors.
      enrollForm.find(getIdSelector('submit')).simulate('click');
      expect(fetchStub.called).to.be.false;
      expect(
        enrollForm.find(getIdSelector('email')).prop('errorMessage')
      ).to.equal('Field is required');
      expect(enrollForm.find(getIdSelector('first_name')).prop('errorMessage'))
        .to.be.undefined;
    });

    // first name and email fields are set as props on page load
    // the user needs to explicitly set them blank for errors to appear
    [
      ['first_name', getIdSelector('first_name')],
      ['email', getIdSelector('email')],
    ].forEach(([param, selector]) => {
      it(`do not submit when user sets blank ${param}`, () => {
        testValidateFields({...requiredParams, [param]: ''}, selector);
      });
    });

    [
      ['last_name', getIdSelector('last_name')],
      ['school_info', getLabelSelector('school_info')],
    ].forEach(([param, selector]) => {
      it(`do not submit when user does not input ${param}`, () => {
        testValidateFields({...requiredParams, [param]: ''}, selector);
      });
    });
  });
});
