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

  test 'logged in can submit' do
    Net::HTTP.stubs(:post_form)
    Net::HTTP.expects(:post_form).returns(FakeResponse.new)

    sign_in(@teacher)

    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: {
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
      }, as: :json

    assert_response :success, "Failed response: #{response.body}"
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
