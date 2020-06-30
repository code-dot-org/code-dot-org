require 'test_helper'

class Api::V1::AmazonFutureEngineerControllerTest < ActionDispatch::IntegrationTest
  setup do
    CDO.stubs(:afe_pardot_form_handler_url).returns('fake_pardot_url.com')
  end

  test 'logged out cannot submit' do
    Net::HTTP.expects(:post_form).never

    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params, as: :json

    assert_response :forbidden
  end

  test 'responds BAD REQUEST when params are malformed' do
    Net::HTTP.expects(:post_form).never

    # Intentionally missing required field traffic-source
    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params.delete('traffic-source'), as: :json

    assert_response :bad_request, "Expected BAD REQUEST, got: #{response.status}\n#{response.body}"
  end

  test 'responds BAD REQUEST when params are missing' do
    Net::HTTP.stubs(:post_form)

    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit'

    assert_response :bad_request, "Expected BAD REQUEST, got: #{response.status}\n#{response.body}"
  end

  test 'responds BAD REQUEST when terms are not accepted' do
    Net::HTTP.expects(:post_form).never
    Honeybadger.expects(:notify)

    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params.merge('consentAFE' => false), as: :json
    assert_response :bad_request, "Wrong response: #{response.body}"
  end

  test 'logged in can submit' do
    Timecop.freeze do
      # Establish an expectation that we post to Pardot with the
      # correct parameters
      expected_call = Net::HTTP.expects(:post_form).with do |url, params|
        url.to_s == CDO.afe_pardot_form_handler_url &&
          params.to_h == {
            'traffic-source' => 'AFE-code.org',
            'first-name' => 'test',
            'last-name' => 'test',
            'email' => 'test@code.org',
            'nces-id' => '123456789012',
            'street-1' => 'test street',
            'street-2' => 'test street 2',
            'city' => 'seattle',
            'state' => 'wa',
            'zip' => '98105',
            'inspirational-marketing-kit' => '0',
            'csta-plus' => '0',
            'aws-educate' => '0',
            'amazon-terms' => '1',
            'new-code-account' => '1',
            'registration-date-time' => Time.now.iso8601
          }
      end
      expected_call.returns fake_response

      sign_in create :teacher
      post '/dashboardapi/v1/amazon_future_engineer_submit',
        params: valid_params, as: :json

      assert_response :success, "Failed response: #{response.body}"
    end
  end

  test 'new-code-account is 0 if the user was created five minutes ago or more' do
    # Expect the post to Pardot with the appropriate new-code-account value
    expected_call = Net::HTTP.expects(:post_form).with do |url, params|
      url.to_s == CDO.afe_pardot_form_handler_url &&
        params['new-code-account'] == '0'
    end
    expected_call.returns fake_response

    Timecop.freeze do
      # Create the teacher more than five minutes before we submit
      teacher = create :teacher
      Timecop.travel(5.minutes)

      sign_in teacher
      post '/dashboardapi/v1/amazon_future_engineer_submit',
        params: valid_params, as: :json
      assert_response :success, "Failed response: #{response.body}"
    end
  end

  test 'new-code-account is 1 if the user was created less than five minutes ago' do
    # Expect the post to Pardot with the appropriate new-code-account value
    expected_call = Net::HTTP.expects(:post_form).with do |url, params|
      url.to_s == CDO.afe_pardot_form_handler_url &&
        params['new-code-account'] == '1'
    end
    expected_call.returns fake_response

    Timecop.freeze do
      # Create the teacher less than five minutes before we submit
      teacher = create :teacher
      Timecop.travel(5.minutes - 1.second)

      sign_in teacher
      post '/dashboardapi/v1/amazon_future_engineer_submit',
        params: valid_params, as: :json
      assert_response :success, "Failed response: #{response.body}"
    end
  end

  private

  def valid_params
    {
      'trafficSource' => 'AFE-code.org',
      'firstName' => 'test',
      'lastName' => 'test',
      'email' => 'test@code.org',
      'schoolId' => '123456789012',
      'street1' => 'test street',
      'street2' => 'test street 2',
      'city' => 'seattle',
      'state' => 'wa',
      'zip' => '98105',
      'inspirationKit' => '0',
      'csta' => '0',
      'consentCSTA' => '0',
      'awsEducate' => '0',
      'consentAFE' => '1'
    }
  end

  def fake_response
    mock.tap do |fake|
      fake.stubs(:status).returns(200)
      fake.stubs(:code).returns('200')
      fake.stubs(:body).returns('')
    end
  end
end
