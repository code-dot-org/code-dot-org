
require 'test_helper'

class Api::V1::Forrm::SubmissionsControllerTest < ActionController::TestCase
  test 'create succeeds' do
    post :create,
      params: {
        form_version: '1',
        form_name: 'test',
        answers: {
          test_question: 'test_answer'
        }
      }
    assert_response 201
    response = JSON.parse(@response.body)
    refute response['submission_id'].nil?, "submission_id expected in response: #{response}"
  end
end
