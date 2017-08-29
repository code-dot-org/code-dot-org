require 'test_helper'

class Pd::PreWorkshopSurveyControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @teacher = create :teacher
    @workshop = create :pd_workshop, course: Pd::Workshop::COURSE_CSD, num_sessions: 1
    @enrollment = create :pd_enrollment, workshop: @workshop, user: @teacher
  end

  setup do
    Pd::Workshop.any_instance.stubs(:pre_survey_units_and_lessons).returns([])
  end

  test_user_gets_response_for(
    :new,
    user: :teacher,
    params: -> {{enrollment_code: @enrollment.code}},
    response: :forbidden
  )

  test_redirect_to_sign_in_for :new, params: -> {{enrollment_code: @enrollment.code}}

  test 'form shown for enrollments without surveys' do
    Pd::PreWorkshopSurvey.stubs(:exists?).with(pd_enrollment_id: @enrollment.id).returns(false)

    sign_in @teacher
    get :new, params: {enrollment_code: @enrollment.code}
    assert_response :success
    assert_select 'h1', text: /Pre-survey for your upcoming\sCS Discoveries\sworkshop/
  end

  test 'thanks shown when already submitted' do
    Pd::PreWorkshopSurvey.stubs(:exists?).with(pd_enrollment_id: @enrollment.id).returns(true)

    sign_in @teacher
    get :new, params: {enrollment_code: @enrollment.code}
    assert_response :success
    assert_select 'h1', text: 'Thank you for submitting your pre-survey!'
  end
end
