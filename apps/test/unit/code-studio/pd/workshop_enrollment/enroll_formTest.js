import React from 'react';
import {assert, expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import jQuery from 'jquery';
import EnrollForm from '@cdo/apps/code-studio/pd/workshop_enrollment/enroll_form';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

const refute = p => assert.isNotOk(p);

describe('Enroll Form', () => {
  // We aren't testing server responses, but have a fake server to handle calls and suppress warnings
  sinon.fakeServer.create();

  const props = {
    workshop_id: 1,
    first_name: 'Rubeus',
    email: 'rhagrid@hogwarts.edu',
    previous_courses: ['Transfiguration', 'Potions', 'Herbology'],
    onSubmissionComplete: () => {}
  };

  describe('CSF Enroll Form', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    });

    it('displays role question and grade question', () => {
      assert(enrollForm.exists('#role'));
      assert(enrollForm.exists('#grades_teaching'));
    });

    it('displays describe role question after other/admin role answer', () => {
      enrollForm.setState({role: 'Other'});
      assert(enrollForm.exists('#describe_role'));
    });

    it("doesn't display describe role question after normal teaching role answer", () => {
      enrollForm.setState({role: 'Librarian'});
      refute(enrollForm.exists('#describe_role'));
    });
  });

  describe('CSF Intro Enroll Form', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          workshop_subject={SubjectNames.SUBJECT_CSF_101}
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    });

    it('displays intent question', () => {
      assert(enrollForm.exists({groupName: 'csf_intro_intent'}));
    });

    it('displays other factors question', () => {
      assert(enrollForm.exists({groupName: 'csf_intro_other_factors'}));
    });
  });

  describe('CSF Deep Dive Enroll Form', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          workshop_subject={SubjectNames.SUBJECT_CSF_201}
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    });

    it('does not display intent question', () => {
      refute(enrollForm.exists({groupName: 'csf_intro_intent'}));
    });

    it('does not display other factors question', () => {
      refute(enrollForm.exists({groupName: 'csf_intro_other_factors'}));
    });
  });

  describe('CSP Enroll Form', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Principles"
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
          collect_demographics={false}
        />
      );
    });

    it('does not display role question', () => {
      refute(enrollForm.exists('#role'));
    });

    it('does not display previous courses question', () => {
      refute(enrollForm.exists('#previous_courses'));
    });

    it('does not display replace existing question', () => {
      refute(enrollForm.exists('#replace_existing'));
    });

    it('does not display intent question', () => {
      refute(enrollForm.exists({groupName: 'csf_intro_intent'}));
    });

    it('does not display other factors question', () => {
      refute(enrollForm.exists({groupName: 'csf_intro_other_factors'}));
    });
  });

  describe('CSP Enroll Form with demographics', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Principles"
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
          collect_demographics={true}
        />
      );
    });

    it('does display previous courses question', () => {
      assert(enrollForm.exists('#previous_courses'));
    });

    it('does display replace existing question', () => {
      assert(enrollForm.exists('#replace_existing'));
    });
  });

  describe('CSP Returning Teachers Form', () => {
    let enrollForm;
    before(() => {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Principles"
          workshop_subject={SubjectNames.SUBJECT_CSP_FOR_RETURNING_TEACHERS}
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
          collect_demographics={false}
        />
      );
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

    ['role', 'previous_courses', 'replace_existing'].forEach(question => {
      it('displays questions not relevant for this workshop type', () => {
        refute(enrollForm.exists('#' + question));
      });
    });

    ['csf_intro_intent', 'csf_intro_other_factors'].forEach(question => {
      it('displays questions not relevant for this workshop type', () => {
        refute(enrollForm.exists({groupName: question}));
      });
    });
  });

  describe('Enroll Form', () => {
    let enrollForm;
    beforeEach(() => {
      sinon.spy(jQuery, 'ajax');
    });
    afterEach(() => {
      jQuery.ajax.restore();
    });

    function renderForm() {
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          first_name={props.first_name}
          email={props.email}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
    }

    it('submits other school_info fields when no school_id', () => {
      renderForm();

      const school_info = {
        school_name: 'Hogwarts School of Witchcraft and Wizardry',
        school_state: 'Washington',
        school_zip: '12345',
        school_type: 'Private school'
      };

      const params = {
        first_name: 'Rubeus',
        last_name: 'Hagrid',
        email: props.email,
        school_info: school_info,
        role: 'Librarian',
        grades_teaching: ['Kindergarten']
      };
      enrollForm.setState(params);

      const expectedSchoolInfo = {...school_info, school_type: 'private'};
      let expectedData = {...params, school_info: expectedSchoolInfo};

      enrollForm.find('#submit').simulate('click');

      expect(jQuery.ajax.calledOnce).to.be.true;
      expect(JSON.parse(jQuery.ajax.getCall(0).args[0].data)).to.deep.equal(
        expectedData
      );
    });

    it("doesn't submit other school_info fields when school_id is selected", () => {
      renderForm();

      const params = {
        first_name: 'Rubeus',
        last_name: 'Hagrid',
        email: props.email,
        school_info: {
          school_id: '60001411118',
          school_name: 'Summit Leadership Academy High Desert',
          school_state: 'CA',
          school_type: 'charter',
          school_zip: '92345'
        },
        role: 'Librarian',
        grades_teaching: ['Kindergarten']
      };
      const expectedData = {...params, school_info: {school_id: '60001411118'}};

      enrollForm.setState(params);
      enrollForm.find('#submit').simulate('click');

      expect(jQuery.ajax.calledOnce).to.be.true;
      expect(JSON.parse(jQuery.ajax.getCall(0).args[0].data)).to.deep.equal(
        expectedData
      );
    });

    it('disables submit button after submit', () => {
      renderForm();

      const params = {
        first_name: 'Rubeus',
        last_name: 'Hagrid',
        email: props.email,
        school_info: {
          school_id: '60001411118',
          school_name: 'Summit Leadership Academy High Desert',
          school_state: 'CA',
          school_type: 'charter',
          school_zip: '92345'
        },
        grades_teaching: ['Kindergarten']
      };
      enrollForm.setState(params);

      // Submit button should stay enabled if invalid data was provided.
      // In this case, no "role" was included, which is a required field.
      expect(enrollForm.find('#submit').prop('disabled')).to.be.false;
      enrollForm.find('#submit').simulate('click');
      expect(enrollForm.find('#submit').prop('disabled')).to.be.false;

      // Submit button becomes disabled once legitimate submission is made.
      enrollForm.setState({role: 'Librarian'});
      enrollForm.find('#submit').simulate('click');
      expect(enrollForm.find('#submit').prop('disabled')).to.be.true;
    });

    it('first name is set when rendered as a student', () => {
      // Sometimes a teacher has a student account and fills out this
      // form.  That's fine; they'll be upgraded to a teacher account
      // later.
      // In the initial state for a student account, we pass a first_name
      // prop but never an email prop, which caused a bug in the past.
      enrollForm = shallow(
        <EnrollForm
          workshop_id={props.workshop_id}
          workshop_course="CS Fundamentals"
          first_name={'Student'}
          email={''}
          previous_courses={props.previous_courses}
          onSubmissionComplete={props.onSubmissionComplete}
        />
      );
      expect(enrollForm.state('email')).to.equal('');
      expect(enrollForm.state('first_name')).to.equal('Student');

      // If I submit in this state, first name should not be one
      // of the validation errors.
      enrollForm.find('#submit').simulate('click');
      expect(jQuery.ajax.called).to.be.false;
      expect(enrollForm.state('errors')).to.have.property('email');
      expect(enrollForm.state('errors')).not.to.have.property('first_name');
    });
  });
});
