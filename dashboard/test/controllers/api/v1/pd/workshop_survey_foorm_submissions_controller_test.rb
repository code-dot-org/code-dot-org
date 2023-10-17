require 'test_helper'

class Api::V1::Pd::WorkshopSurveyFoormSubmissionsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true
  setup do
    @user = create :user
    @pd_summer_workshop = create :csp_summer_workshop
    @foorm_form = create :foorm_form
    @default_params = {
      answers: {
        question1: 'answer1'
      },
      user_id: @user.id,
      pd_workshop_id: @pd_summer_workshop.id,
      pd_session_id: nil,
      day: 0,
      form_name: @foorm_form.name,
      form_version: @foorm_form.version
    }
  end

  test 'can create and save survey submission' do
    response = post :create, params: @default_params
    assert_response :created
    response_body = JSON.parse(response.body)
    refute_nil response_body['submission_id']
    refute_nil response_body['survey_submission_id']
  end

  # this enforces a requirement which the RED team depends on
  test 'new form submission is linked to workshop' do
    post :create, params: @default_params
    assert_response :created

    foorm_submission_id = JSON.parse(response.body)['submission_id']
    foorm_submission = Foorm::Submission.find(foorm_submission_id)
    assert_equal @pd_summer_workshop.id, foorm_submission.workshop_metadata.pd_workshop_id
  end

  test 'can create and save blank survey submission' do
    response = post :create, params: @default_params.except(:answers)
    assert_response :created
    response_body = JSON.parse(response.body)
    refute_nil response_body['submission_id']
    refute_nil response_body['survey_submission_id']

    # A submission's answers cannot be null, so we store a blank JSON object string if a submission has no answers
    assert_equal "{}", Pd::WorkshopSurveyFoormSubmission.find(response_body['survey_submission_id']).foorm_submission.answers
  end

  test 'return conflict if user had already submitted a response' do
    params = @default_params.merge({day: nil, form_name: nil})

    response = post :create, params: params
    assert_response :created
    response_body = JSON.parse(response.body)
    refute_nil response_body['submission_id']
    refute_nil response_body['survey_submission_id']

    post :create, params: params
    assert_response :conflict
  end

  test 'return conflict if user had already submitted a response, using all params' do
    params = @default_params.merge({pd_session_id: 123})

    response = post :create, params: params
    assert_response :created
    response_body = JSON.parse(response.body)
    refute_nil response_body['submission_id']
    refute_nil response_body['survey_submission_id']

    post :create, params: params
    assert_response :conflict
  end
end
