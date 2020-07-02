require 'test_helper'

class Api::V1::AmazonFutureEngineerControllerTest < ActionDispatch::IntegrationTest
  test 'logged out cannot submit' do
    Services::AFEEnrollment.expects(:submit).never

    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params, as: :json

    assert_response :forbidden
  end

  test 'responds BAD REQUEST when params are malformed' do
    Services::AFEEnrollment.expects(:submit).never

    # Intentionally missing required field traffic-source
    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params.delete('email'), as: :json

    assert_response :bad_request, "Expected BAD REQUEST, got: #{response.status}\n#{response.body}"
  end

  test 'responds BAD REQUEST when params are missing' do
    Services::AFEEnrollment.expects(:submit).never

    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit'

    assert_response :bad_request, "Expected BAD REQUEST, got: #{response.status}\n#{response.body}"
  end

  test 'responds BAD REQUEST when an AFEEnrollment error occurs' do
    # For example, that class encodes some business rules like
    # "don't submit without consent" and raises its own error type
    # when one of these rules is violated.  For details, see that
    # class and its tests.
    Services::AFEEnrollment.expects(:submit).raises(Services::AFEEnrollment::Error)

    # We want failures of this type to be logged to HB
    Honeybadger.expects(:notify)

    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit', params: valid_params, as: :json
    assert_response :bad_request, "Wrong response: #{response.body}"
  end

  test 'logged in can submit' do
    Services::AFEEnrollment.expects(:submit).with(
      first_name: 'test',
      last_name: 'test',
      email: 'test@code.org',
      nces_id: '123456789012',
      street_1: 'test street',
      street_2: 'test street 2',
      city: 'seattle',
      state: 'wa',
      zip: '98105',
      marketing_kit: '0',
      csta_plus: '0',
      aws_educate: '0',
      amazon_terms: '1',
      new_code_account: true
    )

    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params, as: :json

    assert_response :success, "Failed response: #{response.body}"
  end

  test 'new-code-account is 0 if the user was created five minutes ago or more' do
    # Expect to submit with the appropriate new-code-account value
    Services::AFEEnrollment.expects(:submit).with do |params|
      params[:new_code_account] == false
    end

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
    # Expect to submit with the appropriate new-code-account value
    Services::AFEEnrollment.expects(:submit).with do |params|
      params[:new_code_account] == true
    end

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
      fake.stubs(:code).returns('200')
      fake.stubs(:body).returns('')
    end
  end
end
