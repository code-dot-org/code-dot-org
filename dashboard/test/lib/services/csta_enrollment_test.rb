require 'test_helper'

class Services::CSTAEnrollmentTest < ActiveSupport::TestCase
  setup do
    CDO.stubs(:csta_jotform_api_key).returns('fake-key')
    CDO.stubs(:csta_jotform_form_id).returns('fake-form-id')
  end

  test 'does nothing if configuration is missing' do
    CDO.unstub(:csta_jotform_api_key)
    CDO.unstub(:csta_jotform_form_id)
    CDO.stubs(:csta_jotform_api_key).returns(nil)
    CDO.stubs(:csta_jotform_form_id).returns(nil)
    Net::HTTP.expects(:post_form).never
    Services::CSTAEnrollment.submit(valid_params)
  end

  test 'posts to CSTA Jotform in the expected format' do
    expected_request = Net::HTTP.expects(:post_form).with(
      URI("https://api.jotform.com/form/#{CDO.csta_jotform_form_id}/submissions?apiKey=#{CDO.csta_jotform_api_key}"),
      {
        'submission[15_first]' => 'test-first-name',
        'submission[15_last]' => 'test-last-name',
        'submission[16]' => 'test-email',
        'submission[5]' => 'test-school-district-name',
        'submission[18]' => 'test-school-name',
        'submission[17_st1]' => 'test-street-1',
        'submission[17_st2]' => 'test-street-2',
        'submission[17_city]' => 'test-city',
        'submission[17_state]' => 'test-state',
        'submission[17_zip]' => 'test-zip',
        'submission[19]' => "Yes, I provide my consent."
      }
    )
    expected_request.returns(success_response)

    Services::CSTAEnrollment.submit(valid_params)
  end

  test 'raises without submitting if privacy_permission is not true' do
    Net::HTTP.expects(:post_form).never
    assert_raises_matching /CSTA submission skipped: Privacy consent was not provided/ do
      Services::CSTAEnrollment.submit(valid_params.merge(privacy_permission: false))
    end
  end

  test 'raises when JotForm response is a failure' do
    Net::HTTP.expects(:post_form).returns(failure_response)
    assert_raises_matching /CSTA submission failed/ do
      Services::CSTAEnrollment.submit(valid_params)
    end
  end

  private

  def valid_params
    {
      first_name: 'test-first-name',
      last_name: 'test-last-name',
      email: 'test-email',
      school_district_name: 'test-school-district-name',
      school_name: 'test-school-name',
      street_1: 'test-street-1',
      street_2: 'test-street-2',
      city: 'test-city',
      state: 'test-state',
      zip: 'test-zip',
      privacy_permission: true
    }
  end

  def success_response
    mock.tap do |response|
      # This is what a real success response from this API looks like
      response.stubs(:code).returns('200')
      response.stubs(:body).returns(<<~BODY)
        {
          "responseCode": 200,
          "message": "success",
          "content": {
            "submissionID": "4693670621822232790",
            "URL": "https:\/\/api.jotform.com\/submission\/4693670621822232790"
          },
          "duration": "24ms",
          "limit-left": 49996
        }
      BODY
    end
  end

  def failure_response
    mock.tap do |response|
      # This is the only real failure I was able to generate when
      # testing this API - it's a response to sending no fields
      # at all.
      response.stubs(:code).returns('400')
      response.stubs(:body).returns(<<~BODY)
        {
          "responseCode": 400,
          "message": "Bad request (\/form-id-submissions) - Submissions couldn't inserted",
          "content": [],
          "duration": "12ms",
          "info": "https:\/\/api.jotform.com\/docs#form-id-submissions"
        }
      BODY
    end
  end
end
