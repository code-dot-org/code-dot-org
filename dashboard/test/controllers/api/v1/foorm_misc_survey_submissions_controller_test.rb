require 'test_helper'

class Api::V1::FoormMiscSurveySubmissionsControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup do
    @user = create :user
    @foorm_form = create :foorm_form
  end

  test 'can create and save survey submission' do
    params = {
      answers: {
        question1: 'answer1'
      },
      user_id: @user.id,
      form_name: @foorm_form.name,
      form_version: @foorm_form.version,
      misc_form_path: 'sample_path'
    }

    response = post :create, params: params
    assert_response :created
    response_body = JSON.parse(response.body)
    assert_not_nil response_body['foorm_submission_id']
    assert_not_nil response_body['misc_survey_submission_id']
  end
end
