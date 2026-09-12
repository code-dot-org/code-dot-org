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
    Services::CSTAEnrollment.submit(**valid_params)
  end

  test 'posts to CSTA Jotform in the expected format' do
    expected_request = Net::HTTP.expects(:post_form).with(
      URI("https://api.jotform.com/form/#{CDO.csta_jotform_form_id}/submissions?apiKey=#{CDO.csta_jotform_api_key}"),
      {
        'submission[15_first]' => 'test-first-name',
        'submission[15_last]' => 'test-last-name',
        'submission[16]' => 'test-email',
        'submission[5]' => 'Test School District Name',
        'submission[18]' => 'Test School Name',
        'submission[17_st1]' => 'Test Street 1',
        'submission[17_st2]' => 'Test Street 2',
        'submission[17_city]' => 'Test City',
        'submission[17_state]' => 'WA',
        'submission[17_zip]' => '12345',
        'submission[19]' => "Yes, I provide my consent.",
        'submission[25]' => "Role with Spaces",
        'submission[22]' => "K-5, 6-8, ",
      }
    )
    expected_request.returns(success_response)

    Services::CSTAEnrollment.submit(**valid_params)
  end

  test 'raises without submitting if privacy_permission is not true' do
    Net::HTTP.expects(:post_form).never
    assert_raises_matching /CSTA submission skipped: Privacy consent was not provided/ do
      Services::CSTAEnrollment.submit(**valid_params.merge(privacy_permission: false))
    end
  end

  test 'raises when JotForm response is a failure' do
    Net::HTTP.expects(:post_form).returns(failure_response)
    assert_raises_matching /CSTA submission failed/ do
      Services::CSTAEnrollment.submit(**valid_params)
    end
  end

  test 'converts school name to title case' do
    assert_transform(
      {school_name: 'HOLMES ACADEMY'},
      {'submission[18]' => 'Holmes Academy'}
    )

    # Does not handle acronyms; we're fine with this.
    assert_transform(
      {school_name: 'D.W. DUCK USD'},
      {'submission[18]' => 'D.W. Duck Usd'}
    )
  end

  test 'converts school district name to title case' do
    assert_transform(
      {school_district_name: 'NORTH LONDON SCHOOL DISTRICT'},
      {'submission[5]' => 'North London School District'}
    )
  end

  test 'converts address 1 to title case' do
    assert_transform(
      {street_1: '101 WALKING WAY'},
      {'submission[17_st1]' => '101 Walking Way'}
    )

    # Cardinal directions are upcased (since they are so common)
    assert_transform(
      {street_1: '123 SE SEMVER WAY'},
      {'submission[17_st1]' => '123 SE Semver Way'}
    )

    # An odd case: The "B" is separated from the house number
    assert_transform(
      {street_1: '221B BAKER STREET'},
      {'submission[17_st1]' => '221 B Baker Street'}
    )
  end

  test 'converts address 2 to title case' do
    assert_transform(
      {street_2: 'ATTN: MRS. HUDSON'},
      {'submission[17_st2]' => 'Attn: Mrs. Hudson'}
    )
  end

  test 'converts city to title case' do
    assert_transform(
      {city: 'LONDON'},
      {'submission[17_city]' => 'London'}
    )
  end

  test 'converts state to a two-letter code' do
    assert_transform(
      {state: 'OHIO'},
      {'submission[17_state]' => 'OH'}
    )

    # No transform if the state is already a two-letter code
    assert_transform(
      {state: 'OH'},
      {'submission[17_state]' => 'OH'}
    )
  end

  class V2Test < ActiveSupport::TestCase
    setup do
      CDO.stubs(:csta_jotform_api_key).returns('fake-key')
      CDO.stubs(:csta_jotform_form_id).returns('fake-form-id')
      DCDO.stubs(:get).with(Services::CSTAEnrollment::CSTA_JOTFORM_V2_DCDO_KEY, false).returns(true)
    end

    test 'posts to CSTA Jotform in the expected v2 format' do
      expected_request = Net::HTTP.expects(:post_form).with(
        URI("https://api.jotform.com/form/#{CDO.csta_jotform_form_id}/submissions?apiKey=#{CDO.csta_jotform_api_key}"),
        {
          'submission[15_first]'      => 'test-first-name',
          'submission[15_last]'       => 'test-last-name',
          'submission[16]'            => 'test-email',
          'submission[5]'             => 'Test School District Name',
          'submission[30]'            => 'Test School Name',
          'submission[18]'            => '123456789012',
          'submission[17_addr_line1]' => 'Test Street 1',
          'submission[17_addr_line2]' => 'Test Street 2',
          'submission[17_city]'       => 'Test City',
          'submission[17_postal]'     => '12345',
          'submission[29]'            => 'WA',
          'submission[19]'            => "Yes, I provide my consent.",
          'submission[25]'            => 'Role with Spaces',
          'submission[27]'            => 'Non-Binary',
          'submission[28]'            => 'CSTA Washington',
          'submission[22][0]'         => 'K to 5',
          'submission[22][1]'         => '6 to 8',
          'submission[26][0]'         => 'Asian or Asian American',
          'submission[26][1]'         => 'Hispanic or Latino',
        }
      )
      expected_request.returns(success_response)

      Services::CSTAEnrollment.submit(**v2_valid_params)
    end

    test 'serializes a single grade band' do
      assert_v2_transform(
        {grades_teaching: ['9 to 12']},
        {'submission[22][0]' => '9 to 12'}
      )
    end

    test 'omits multi-select keys when no values are selected' do
      captured_args = nil
      Net::HTTP.expects(:post_form).with {|_, args| captured_args = args}.returns(success_response)

      Services::CSTAEnrollment.submit(
        **v2_valid_params.merge(grades_teaching: [], ethnicity_race: [])
      )

      refute(captured_args.keys.any? {|k| k.start_with?('submission[22]')})
      refute(captured_args.keys.any? {|k| k.start_with?('submission[26]')})
    end

    test 'sends empty strings for unset gender, chapter, and NCES' do
      assert_v2_transform(
        {gender_identity: '', primary_chapter: '', nces_id: ''},
        {
          'submission[27]' => '',
          'submission[28]' => '',
          'submission[18]' => '',
        }
      )
    end

    test 'state lands at qid 29, not inside the address block' do
      captured_args = nil
      Net::HTTP.expects(:post_form).with {|_, args| captured_args = args}.returns(success_response)

      Services::CSTAEnrollment.submit(**v2_valid_params.merge(state: 'Ohio'))

      assert_equal 'OH', captured_args['submission[29]']
      refute captured_args.key?('submission[17_state]')
    end

    test 'raises without submitting if privacy_permission is not true' do
      Net::HTTP.expects(:post_form).never
      assert_raises_matching /CSTA submission skipped: Privacy consent was not provided/ do
        Services::CSTAEnrollment.submit(**v2_valid_params.merge(privacy_permission: false))
      end
    end

    private def assert_v2_transform(input, expected_output)
      captured_args = nil
      Net::HTTP.expects(:post_form).with {|_, args| captured_args = args}.returns(success_response)
      Services::CSTAEnrollment.submit(**v2_valid_params.merge(input))
      expected_output.each do |key, value|
        assert_equal value, captured_args[key]
      end
    end

    private def v2_valid_params
      {
        first_name: 'test-first-name',
        last_name: 'test-last-name',
        email: 'test-email',
        school_district_name: 'Test School District Name',
        school_name: 'Test School Name',
        street_1: 'Test Street 1',
        street_2: 'Test Street 2',
        city: 'Test City',
        state: 'WA',
        zip: '12345',
        professional_role: 'Role with Spaces',
        grades_teaching: ['K to 5', '6 to 8'],
        privacy_permission: true,
        nces_id: '123456789012',
        ethnicity_race: ['Asian or Asian American', 'Hispanic or Latino'],
        gender_identity: 'Non-Binary',
        primary_chapter: 'CSTA Washington',
      }
    end

    private def success_response
      mock.tap do |response|
        response.stubs(:code).returns('200')
        response.stubs(:body).returns('{"responseCode":200,"message":"success"}')
      end
    end
  end

  # @param [Hash] input params, merged over an existing set of valid parameters.
  # @param [Hash] expected_output POST parameters as key-value pairs that we expect to see
  #   in the request to CSTA given the provided input params.
  private def assert_transform(input, expected_output)
    captured_args = nil
    expected_request = Net::HTTP.expects(:post_form).with {|_, args| captured_args = args}
    expected_request.returns(success_response)

    Services::CSTAEnrollment.submit(**valid_params.merge(input))

    expected_output.each do |key, value|
      assert_equal value, captured_args[key]
    end
  end

  private def valid_params
    {
      first_name: 'test-first-name',
      last_name: 'test-last-name',
      email: 'test-email',
      school_district_name: 'Test School District Name',
      school_name: 'Test School Name',
      street_1: 'Test Street 1',
      street_2: 'Test Street 2',
      city: 'Test City',
      state: 'WA',
      zip: '12345',
      professional_role: 'Role with Spaces',
      grades_teaching: 'K-5, 6-8, ',
      privacy_permission: true
    }
  end

  private def success_response
    mock.tap do |response|
      # This is what a real success response from this API looks like
      response.stubs(:code).returns('200')
      response.stubs(:body).returns(<<~BODY)
        {
          "responseCode": 200,
          "message": "success",
          "content": {
            "submissionID": "4693670621822232790",
            "URL": "https://api.jotform.com/submission/4693670621822232790"
          },
          "duration": "24ms",
          "limit-left": 49996
        }
      BODY
    end
  end

  private def failure_response
    mock.tap do |response|
      # This is the only real failure I was able to generate when
      # testing this API - it's a response to sending no fields
      # at all.
      response.stubs(:code).returns('400')
      response.stubs(:body).returns(<<~BODY)
        {
          "responseCode": 400,
          "message": "Bad request (/form-id-submissions) - Submissions couldn't inserted",
          "content": [],
          "duration": "12ms",
          "info": "https://api.jotform.com/docs#form-id-submissions"
        }
      BODY
    end
  end
end
