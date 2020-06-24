require 'test_helper'

class Api::V1::AmazonFutureEngineerControllerTest < ActionDispatch::IntegrationTest
  setup do
    @teacher = create :teacher
  end

  test 'logged out cannot submit' do
    # Add expectation that there are no HTTP requests to Pardot.

    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: {
        'first-name' => 'test',
        'last-name' => 'test'
      }, as: :json

    assert_response :forbidden
  end

  test 'submit returns BAD REQUEST when params are malformed' do
    Net::HTTP.expects(:post_form).never
    sign_in create :teacher

    # Intentionally missing required field traffic-source
    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params.delete('traffic-source'), as: :json

    assert_response :bad_request, "Expected BAD REQUEST, got: #{response.status}\n#{response.body}"
  end

  test 'logged in can submit' do
    Net::HTTP.expects(:post_form).returns(FakeResponse.new)

    sign_in(@teacher)

    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params, as: :json

    assert_response :success, "Failed response: #{response.body}"
  end

  private

  def valid_params
    {
      'traffic-source' => 'AFE-code.org',
      'first-name' => 'test',
      'last-name' => 'test',
      'email' => 'test@code.org',
      'nces-id' => '123456789012',
      'street-1' => 'test street',
      'city' => 'seattle',
      'state' => 'wa',
      'zip' => '98105',
      'inspirational-marketing-kit' => '0',
      'csta-plus' => '0',
      'aws-educate' => '0',
      'amazon-terms' => '1',
      'new-code-account' => '0',
      'registration-date-time' => '1997-07-16T19:20:30+01:00'
    }
  end

  class FakeResponse
    def code
      '200'
    end

    def body
      ''
    end
  end
end
