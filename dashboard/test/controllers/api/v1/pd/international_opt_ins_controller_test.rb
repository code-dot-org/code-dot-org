require 'test_helper'

class Api::V1::Pd::InternationalOptInsControllerTest < ::ActionController::TestCase
  SAMPLE_FORM_DATA = {
    first_name: 'First',
    first_name_preferred: 'Preferred',
    last_name: 'Last',
    email: 'foo@bar.com',
    email_alternate: 'footoo@bar.com',
    gender: 'Prefer not to answer',
    school_name: 'School Name',
    school_city: 'School City',
    school_country: 'School Country',
    ages: ['19+ years old'],
    subjects: ['ICT'],
    resources: ['Kodable'],
    robotics: ['LEGO Education'],
    workshop_organizer: 'Workshop Organizer',
    workshop_facilitator: 'Workshop Facilitator',
    workshop_course: 'Workshop Course',
    email_opt_in: 'Yes',
    legal_opt_in: true
  }

  self.use_transactional_test_case = true
  setup_all do
    @teacher = create :teacher
  end

  test 'create creates a new international opt-in' do
    sign_in @teacher
    assert_creates Pd::InternationalOptIn do
      put :create, params: {
        form_data: SAMPLE_FORM_DATA,
        user: @teacher
      }
      assert_response :created
    end
  end

  test 'create returns appropriate errors if international opt-in data is missing' do
    sign_in @teacher

    new_form = SAMPLE_FORM_DATA.dup
    new_form.delete :last_name

    assert_does_not_create Pd::InternationalOptIn do
      put :create, params: {
        form_data: new_form,
        user: @teacher
      }
      assert_response :bad_request
    end
  end

  test 'students can not create a new international opt-in' do
    student = create :student
    sign_in student

    assert_does_not_create Pd::InternationalOptIn do
      put :create, params: {
        form_data: SAMPLE_FORM_DATA,
        user: student
      }
      assert_response :forbidden
    end
  end

  test 'user required to create a new international opt-in' do
    assert_does_not_create Pd::InternationalOptIn do
      put :create, params: {
        form_data: SAMPLE_FORM_DATA,
        user: nil
      }
      assert_response :redirect
    end
  end
end
