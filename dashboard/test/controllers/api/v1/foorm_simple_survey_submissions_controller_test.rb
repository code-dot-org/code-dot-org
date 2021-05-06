require 'test_helper'

class Api::V1::FoormSimpleSurveySubmissionsControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup do
    @user = create :user
    @foorm_form = create :foorm_form
    @simple_survey_form = create :foorm_simple_survey_form

    @params = {
      answers: {
        question1: 'answer1'
      },
      user_id: @user.id,
      form_name: @foorm_form.name,
      form_version: @foorm_form.version,
      simple_survey_form_id: @simple_survey_form.id
    }
  end

  test 'can create and save survey submission' do
    response = post :create, params: @params

    assert_response :created

    response_body = JSON.parse(response.body)

    assert_not_nil response_body['foorm_submission_id']
    assert_not_nil response_body['simple_survey_submission_id']
    assert_equal @simple_survey_form.id, response_body['simple_survey_form_id']
  end
end
