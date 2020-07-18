require 'test_helper'

class Api::V1::AmazonFutureEngineerControllerTest < ActionDispatch::IntegrationTest
  setup do
    # Stub these services to ensure we won't make network requests
    # during this test.  We sometimes set expectations on these later.
    Services::AFEEnrollment.stubs(:submit)
    Services::CSTAEnrollment.stubs(:submit)
  end

  test 'logged out cannot submit' do
    Services::AFEEnrollment.expects(:submit).never

    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params, as: :json

    assert_response :forbidden
  end

  test 'logged in student cannot submit' do
    Services::AFEEnrollment.expects(:submit).never

    sign_in create :student

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
      state: 'Washington',
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
    skip # flaky; see https://github.com/code-dot-org/code-dot-org/pull/35830
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
    skip # flaky; see https://github.com/code-dot-org/code-dot-org/pull/35830
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

  test 'submits to CSTA if csta is provided' do
    actual_args = capture_csta_args_for_request(
      valid_params.merge(
        'csta' => [true, 'true', 1, '1'].sample,
        'consentCSTA' => [true, 'true', 1, '1'].sample,
      )
    )

    assert_equal(
      {
        first_name: 'test',
        last_name: 'test',
        email: 'test@code.org',
        school_district_name: '',
        school_name: '',
        street_1: 'test street',
        street_2: 'test street 2',
        city: 'seattle',
        state: 'Washington',
        zip: '98105',
        privacy_permission: true
      },
      actual_args
    )
  end

  test 'sends school name and district name as found by NCES id' do
    school = create :school

    actual_args = capture_csta_args_for_request(
      valid_params.merge(
        'csta' => true,
        'schoolId' => school.id.to_s
      )
    )

    assert_equal school.name, actual_args[:school_name]
    assert_equal school.school_district.name, actual_args[:school_district_name]
  end

  test 'sends blank school and district name if school is not found by id' do
    School.expects(:find_by).with(id: '000000000000').returns(nil)

    actual_args = capture_csta_args_for_request(
      valid_params.merge(
        'csta' => true,
        'schoolId' => '000000000000'
      )
    )

    assert_equal '', actual_args[:school_name]
    assert_equal '', actual_args[:school_district_name]
  end

  test 'sends address info from request if preset' do
    # This scenario reflects what happens when a teacher signs up for CSTA Plus
    # and also for the AFE Inspirational Marketing Kit, so we asked the teacher
    # for a school address as part of the form.
    school = create :school
    refute_equal 'example-street-1', school.address_line1

    actual_args = capture_csta_args_for_request(
      valid_params.merge(
        'csta' => true,
        'schoolId' => school.id,
        'street1' => 'example-street-1',
        'street2' => 'example-street-2',
        'city' => 'example-city',
        'state' => 'Florida',
        'zip' => 'example-zip'
      )
    )

    assert_equal 'example-street-1', actual_args[:street_1]
    assert_equal 'example-street-2', actual_args[:street_2]
    assert_equal 'example-city', actual_args[:city]
    assert_equal 'Florida', actual_args[:state]
    assert_equal 'example-zip', actual_args[:zip]
  end

  test 'sends address info from our records if request does not include address' do
    # This scenario reflects what happens when a teacher signs up for CSTA Plus
    # but does not opt-in to the AFE Inspirational Marketing Kit, so we don't
    # ask them for a school address on the client.
    school = create :school

    actual_args = capture_csta_args_for_request(
      valid_params.
        merge(
          'csta' => true,
          'schoolId' => school.id,
        ).
        except('street1', 'street2', 'city', 'state', 'zip')
    )

    assert_equal school.address_line1, actual_args[:street_1]
    assert_equal school.address_line2, actual_args[:street_2]
    assert_equal school.city, actual_args[:city]
    assert_equal school.state, actual_args[:state]
    assert_equal school.zip, actual_args[:zip]
  end

  test 'sends empty address info if neither request nor school can provide it' do
    # This probably won't happen, but we'd like to detect and handle a graceful fallback
    School.expects(:find_by).returns(nil)

    actual_args = capture_csta_args_for_request(
      valid_params.
        merge('csta' => true).
        except('street1', 'street2', 'city', 'state', 'zip')
    )

    assert_equal '', actual_args[:street_1]
    assert_equal '', actual_args[:street_2]
    assert_equal '', actual_args[:city]
    assert_equal '', actual_args[:state]
    assert_equal '', actual_args[:zip]
  end

  test 'does not submit to CSTA if csta is false' do
    Services::AFEEnrollment.expects(:submit)
    Services::CSTAEnrollment.expects(:submit).never

    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params.merge(
        'csta' => [false, 'false', 0, '0'].sample,
      ),
      as: :json

    assert_response :success, "Failed response: #{response.body}"
  end

  test 'responds BAD REQUEST when a CSTAEnrollment error occurs' do
    # For example, that class encodes some business rules like
    # "don't submit if privacy terms are not agreed to" and raises its own
    # error type when one of these rules is violated.  For details, see that
    # class and its tests.
    Services::CSTAEnrollment.expects(:submit).raises(Services::CSTAEnrollment::Error)

    # We want failures of this type to be logged to HB
    Honeybadger.expects(:notify)

    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params.merge('csta' => true),
      as: :json
    assert_response :bad_request, "Wrong response: #{response.body}"
  end

  test 'submits Firehose logging for valid request' do
    FirehoseClient.any_instance.expects(:put_record).once

    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params, as: :json
  end

  test 'no Firehose logging for invalid request' do
    FirehoseClient.any_instance.expects(:put_record).never

    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: valid_params.delete('email'), as: :json
  end

  private

  def capture_csta_args_for_request(request_params)
    captured_args = nil
    Services::CSTAEnrollment.expects(:submit).with do |args|
      captured_args = args; true
    end

    sign_in create :teacher
    post '/dashboardapi/v1/amazon_future_engineer_submit',
      params: request_params,
      as: :json

    assert_response :success, "Failed response: #{response.body}"
    refute_nil captured_args
    captured_args
  end

  def valid_params
    {
      'firstName' => 'test',
      'lastName' => 'test',
      'email' => 'test@code.org',
      'schoolId' => '123456789012',
      'street1' => 'test street',
      'street2' => 'test street 2',
      'city' => 'seattle',
      'state' => 'Washington',
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
