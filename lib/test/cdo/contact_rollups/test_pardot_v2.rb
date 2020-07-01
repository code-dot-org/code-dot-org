require_relative '../../test_helper'
require 'cdo/contact_rollups/v2/pardot'
require 'cdo/shared_constants/pd/shared_workshop_constants.rb'

class PardotV2Test < Minitest::Test
  include Pd::SharedWorkshopConstants

  def test_retrieve_prospects_without_result
    empty_response = create_xml_from_heredoc <<~XML
      <rsp stat="ok"><result></result></rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).once.returns(empty_response)

    yielded_result = nil
    result = PardotV2.retrieve_prospects(0, ['id']) {|mappings| yielded_result = mappings}

    assert_equal 0, result
    assert_equal nil, yielded_result
  end

  def test_retrieve_prospects_with_result
    pardot_id = '1'
    email = 'alex@rollups.com'
    nonempty_response = create_xml_from_heredoc <<~XML
      <rsp stat="ok">
        <result>
          <prospect>
            <id>#{pardot_id}</id>
            <email>#{email}</email>
          </prospect>
        </result>
      </rsp>
    XML
    empty_response = create_xml_from_heredoc <<~XML
      <rsp stat="ok"><result></result></rsp>
    XML

    PardotV2.stubs(:post_with_auth_retry).
      returns(nonempty_response).
      returns(empty_response)

    yielded_result = nil
    result = PardotV2.retrieve_prospects(0, %w(id email)) {|mappings| yielded_result = mappings}

    assert_equal 1, result
    assert_equal [{'id' => pardot_id, 'email' => email}], yielded_result
  end

  def test_build_prospect_query_url
    # Create query to retrieve active prospects
    assert_equal(
      "#{PardotV2::PROSPECT_QUERY_URL}?output=bulk&sort_by=id&id_greater_than=0&fields=id,email",
      PardotV2.build_prospect_query_url(0, %w(id email), nil, false)
    )

    # Create query to retrieve only deleted prospects
    assert_equal(
      "#{PardotV2::PROSPECT_QUERY_URL}?output=bulk&sort_by=id&id_greater_than=0&fields=id,email&deleted=true",
      PardotV2.build_prospect_query_url(0, %w(id email), nil, true)
    )
  end

  def test_batch_create_prospects_single_contact
    contact = {email: 'crv2_test@domain.com', data: {opt_in: 1}}

    ok_response = create_xml_from_heredoc <<~XML
      <rsp stat="ok" version="1.0">
        <errors/>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).once.returns(ok_response)

    # Eagerly send a batch-create request
    pardot_writer = PardotV2.new
    submitted, errors = pardot_writer.batch_create_prospects contact[:email], contact[:data], true

    expected_submissions = [{email: contact[:email], db_Opt_In: 'Yes'}]
    assert_equal expected_submissions, submitted
    assert_equal [], errors
  end

  def test_batch_create_prospects_multiple_contacts
    contacts = [
      {email: 'invalid_email', data: {opt_in: 0}},
      {email: 'crv2_test@domain.com', data: {opt_in: 1}}
    ]

    response_with_errors = create_xml_from_heredoc <<~XML
      <rsp stat="fail" version="1.0">
        <errors>
          <prospect identifier="0">#{PardotHelpers::ERROR_INVALID_EMAIL}</prospect>
        </errors>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).once.returns(response_with_errors)

    # Calling batch_create for each contact. No request shall be sent
    pardot_writer = PardotV2.new
    contacts.each do |contact|
      submissions, errors = pardot_writer.batch_create_prospects contact[:email], contact[:data]
      assert_equal [], submissions
      assert_equal [], errors
    end

    # Flushing out the remaining data. Request shall be sent immediately
    submissions, errors = pardot_writer.batch_create_remaining_prospects

    expected_submissions = [
      {email: contacts.first[:email], db_Opt_In: 'No'},
      {email: contacts.last[:email], db_Opt_In: 'Yes'}
    ]
    expected_errors = [{prospect_index: 0, error_msg: PardotHelpers::ERROR_INVALID_EMAIL}]
    assert_equal expected_submissions, submissions
    assert_equal expected_errors, errors
  end

  def test_batch_update_prospects_single_contact
    # TODO: add more fields to new_contact_data so that new_contact_data and old_prospect_data
    #   semantically overlap (field names could be different).
    #   Same in test_batch_update_prospects_multiple_contacts.
    contact = {
      email: 'alpha@cdo.org',
      pardot_id: 1,
      old_prospect_data: {db_Opt_In: 'Yes'},
      new_contact_data: {opt_in: 0}
    }

    ok_response = create_xml_from_heredoc <<~XML
      <rsp stat="ok" version="1.0">
        <errors/>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).once.returns(ok_response)

    pardot_writer = PardotV2.new
    # Eagerly submit an update request
    submissions, errors = pardot_writer.batch_update_prospects(
      *contact.values_at(:email, :pardot_id, :old_prospect_data, :new_contact_data),
      true
    )

    expected_submissions = [
      {email: contact[:email], id: contact[:pardot_id], db_Opt_In: 'No'}
    ]
    assert_equal expected_submissions, submissions
    assert_equal [], errors
  end

  def test_batch_update_prospects_multiple_contacts
    contacts = [
      {
        email: 'alpha@cdo.org',
        pardot_id: 1,
        old_prospect_data: {db_Opt_In: 'Yes'},
        new_contact_data: {opt_in: 0}
      },
      {
        email: 'beta@cdo.org',
        pardot_id: 2,
        old_prospect_data: nil,
        new_contact_data: {opt_in: 1}
      }
    ]

    response_with_errors = create_xml_from_heredoc <<~XML
      <rsp stat="fail" version="1.0">
        <errors>
          <prospect identifier="0">#{PardotHelpers::ERROR_INVALID_EMAIL}</prospect>
        </errors>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).once.returns(response_with_errors)

    # Calling batch_update for each contact. No update request shall be sent
    pardot_writer = PardotV2.new
    contacts.each do |contact|
      submissions, errors = pardot_writer.batch_update_prospects(
        *contact.values_at(:email, :pardot_id, :old_prospect_data, :new_contact_data)
      )
      assert_equal [], submissions
      assert_equal [], errors
    end

    # Flushing out the remaining data, request shall be sent immediately
    submissions, errors = pardot_writer.batch_update_remaining_prospects

    expected_submissions = [
      {email: contacts.first[:email], id: contacts.first[:pardot_id], db_Opt_In: 'No'},
      {email: contacts.last[:email], id: contacts.last[:pardot_id], db_Opt_In: 'Yes'}
    ]
    expected_errors = [{prospect_index: 0, error_msg: PardotHelpers::ERROR_INVALID_EMAIL}]
    assert_equal expected_submissions, submissions
    assert_equal expected_errors, errors
  end

  def test_convert_to_pardot_prospect_single_value_attributes
    tests = [
      {
        input: {
          email: 'test0@domain.com',
          pardot_id: 10,
          opt_in: 1,
          user_id: 111,
          forms_submitted: 'Census,Petition',
          form_roles: 'engineer,teacher',
          state: 'Washington',
          city: 'Seattle',
          postal_code: '98101',
          country: 'United States',
        },
        expected_output: {
          email: 'test0@domain.com',
          id: 10,
          db_Opt_In: 'Yes',
          db_Has_Teacher_Account: 'true',
          db_Forms_Submitted: 'Census,Petition',
          db_Form_Roles: 'engineer,teacher',
          db_State: 'Washington',
          db_City: 'Seattle',
          db_Postal_Code: '98101',
          db_Country: 'United States',
        }
      },
      {
        input: {bad_key: true},
        expected_output: {}
      }
    ]

    tests.each_with_index do |test, index|
      output = PardotV2.convert_to_pardot_prospect test[:input]
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  def test_convert_to_pardot_prospect_multi_value_attributes
    tests = [
      {
        # multi-value attribute has 1 value
        input: {
          professional_learning_enrolled: COURSE_CSF,
          professional_learning_attended: COURSE_CSF,
          hoc_organizer_years: '2019',
          roles: 'Form Submitter',
        },
        expected_output: {
          db_Professional_Learning_Enrolled_0: COURSE_CSF,
          db_Professional_Learning_Attended_0: COURSE_CSF,
          db_Hour_of_Code_Organizer_0: '2019',
          db_Roles_0: 'Form Submitter',
        }
      },
      {
        # multi-value attribute has more than 1 value
        input: {
          professional_learning_enrolled: "#{COURSE_CSD},#{COURSE_CSF}",
          professional_learning_attended: "#{COURSE_CSP},#{COURSE_ECS}",
          hoc_organizer_years: '2018,2019',
          roles: 'Form Submitter,Petition Signer',
        },
        expected_output: {
          db_Professional_Learning_Enrolled_0: COURSE_CSD,
          db_Professional_Learning_Enrolled_1: COURSE_CSF,
          db_Professional_Learning_Attended_0: COURSE_CSP,
          db_Professional_Learning_Attended_1: COURSE_ECS,
          db_Hour_of_Code_Organizer_0: '2018',
          db_Hour_of_Code_Organizer_1: '2019',
          db_Roles_0: 'Form Submitter',
          db_Roles_1: 'Petition Signer',
        }
      }
    ]

    tests.each_with_index do |test, index|
      output = PardotV2.convert_to_pardot_prospect test[:input]
      assert_equal test[:expected_output], output, "Test index #{index} failed"
    end
  end

  def test_extract_prospect_from_response
    fields = %w(email id db_Opt_In db_Roles db_Hour_of_Code_Organizer db_State)
    doc = create_xml_from_heredoc <<~XML
      <rsp stat="ok">
        <result>
          <prospect>
            <id>1</id>
            <email>test@domain.com</email>
            <db_Opt_In>Yes</db_Opt_In>
            <db_Roles>
                <value>Teacher</value>
                <value>CSF Teacher</value>
            </db_Roles>
            <db_Hour_of_Code_Organizer>2013</db_Hour_of_Code_Organizer>
            <db_Name>TestName</db_Name>
          </prospect>
        </result>
      </rsp>
    XML

    # In the sample response above, db_Roles and db_Hour_of_Code_Organizer are both
    # multi-value fields, one has 2 values while one has only 1.
    # db_State exists only in the list of fields, and db_Name exists only in the sample
    # response, both should not be in the expected result.
    expected_prospect = {
      'id' => '1',
      'email' => 'test@domain.com',
      'db_Opt_In' => 'Yes',
      'db_Roles_0' => 'CSF Teacher',
      'db_Roles_1' => 'Teacher',
      'db_Hour_of_Code_Organizer_0' => '2013',
    }

    prospect_node = doc.xpath('/rsp/result/prospect').first
    prospect = PardotV2.extract_prospect_from_response(prospect_node, fields)

    assert_equal expected_prospect, prospect
  end

  def test_extract_prospect_from_response_is_consistent_with_other_method
    # Convert contact data to prospect data for uploading to Pardot
    contact_data = {
      pardot_id: '10',
      email: 'test@domain.com',
      opt_in: 1,
      user_id: 111,
      roles: 'Teacher,CSF Teacher',
      hoc_organizer_years: '2013'
    }
    prospect_to_upload = PardotV2.convert_to_pardot_prospect contact_data

    # Assume the prospect is already uploaded to Pardot, download it to the database,
    # and parse the response back to prospect data.
    pardot_response = create_xml_from_heredoc <<~XML
      <rsp stat="ok">
        <result>
          <prospect>
            <id>10</id>
            <email>test@domain.com</email>
            <db_Opt_In>Yes</db_Opt_In>
            <db_Has_Teacher_Account>true</db_Has_Teacher_Account>
            <db_Roles>
                <value>Teacher</value>
                <value>CSF Teacher</value>
            </db_Roles>
            <db_Hour_of_Code_Organizer>2013</db_Hour_of_Code_Organizer>
          </prospect>
        </result>
      </rsp>
    XML
    prospect_node = pardot_response.xpath('/rsp/result/prospect').first
    prospect_fields = %w(id email db_Opt_In db_Has_Teacher_Account db_Roles db_Hour_of_Code_Organizer)
    prospect_downloaded = PardotV2.extract_prospect_from_response(prospect_node, prospect_fields)

    # The two prospect data must match.
    assert_equal prospect_to_upload, prospect_downloaded.deep_symbolize_keys
  end

  def test_build_batch_url
    base_url = PardotV2::BATCH_CREATE_URL
    prospects = [
      {email: 'test@domain.com', id: nil, db_Opt_In: 'No'},
      {email: 'a+b@domain.com', id: nil}
    ]

    subs = {
      "{" => "%7B",
      "}" => "%7D",
      "\"" => "%22",
      "+" => "%2B"
    }
    expected_url = "#{base_url}?prospects={\"prospects\":#{prospects.to_json}}".gsub(/[{}"+]/, subs)

    assert_equal expected_url, PardotV2.build_batch_url(base_url, prospects)
  end

  def test_submit_batch_request_ok
    prospects = [
      {email: 'test@domain.com', id: nil, db_Opt_In: 'No'}
    ]

    ok_response = create_xml_from_heredoc <<~XML
      <rsp stat="ok" version="1.0">
        <errors/>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).once.returns(ok_response)

    assert_equal [], PardotV2.submit_batch_request('a_pardot_endpoint', prospects)
  end

  def test_submit_batch_request_with_errors
    prospects = [
      {email: 'test@domain.com', id: nil, db_Opt_In: 'No'}
    ]

    response_with_errors = create_xml_from_heredoc <<~XML
      <rsp stat="fail" version="1.0">
        <errors>
          <prospect identifier="0">Invalid prospect email address</prospect>
          <prospect identifier="1">Another error</prospect>
        </errors>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).once.returns(response_with_errors)

    expected_errors = [
      {prospect_index: 0, error_msg: 'Invalid prospect email address'},
      {prospect_index: 1, error_msg: 'Another error'}
    ]

    assert_equal expected_errors, PardotV2.submit_batch_request('a_pardot_endpoint', prospects)
  end

  def test_calculate_data_delta
    tests = [
      {old_data: nil, new_data: {}, expected_delta: {}},
      {old_data: nil, new_data: {k1: 'v1'}, expected_delta: {k1: 'v1'}},
      {old_data: {k1: 'v1'}, new_data: {}, expected_delta: {}},
      {old_data: {k1: 'v1'}, new_data: {k1: 'v1'}, expected_delta: {}},
      {old_data: {k1: 'v1'}, new_data: {k1: 'v1.1'}, expected_delta: {k1: 'v1.1'}},
      {old_data: {k1: 'v1'}, new_data: {k2: 'v2'}, expected_delta: {k2: 'v2'}},
      {old_data: {k1: nil}, new_data: {k2: 'v2'}, expected_delta: {k2: 'v2'}},
      {
        old_data: {key1: 'v1', key2: 'v2', key3: nil},
        new_data: {key1: 'v1.1', key2: 'v2', key4: 'v4'},
        expected_delta: {key1: 'v1.1', key4: 'v4'}
      }
    ]

    tests.each_with_index do |test, index|
      delta = PardotV2.calculate_data_delta test[:old_data], test[:new_data]
      assert_equal test[:expected_delta], delta, "Test index #{index} failed"
    end
  end

  def test_delete_prospects_by_email_does_not_work_in_non_production
    PardotV2.stubs(:retrieve_pardot_ids_by_email).returns([1])
    PardotV2.expects(:post_with_auth_retry).never
    PardotV2.delete_prospects_by_email('test@domain.com')
  end

  def test_delete_prospects_by_email_finds_matching_pardot_ids
    email = 'test@domain.com'
    read_prospect_url = "#{PardotV2::PROSPECT_READ_URL}/#{email}"
    pardot_response = create_xml_from_heredoc <<~XML
      <rsp stat="ok" version="1.0">
        <prospect>
          <id>1</id>
        </prospect>
      </rsp>
    XML

    PardotV2.expects(:post_with_auth_retry).
      once.with(read_prospect_url).returns(pardot_response)

    # Requesting to delete Pardot prospects in a non-production environment will fail
    refute PardotV2.delete_prospects_by_email(email)
  end

  def test_delete_prospects_by_email_sends_deletion_requests
    email = 'test@domain.com'
    read_prospect_url = "#{PardotV2::PROSPECT_READ_URL}/#{email}"
    pardot_response = create_xml_from_heredoc <<~XML
      <rsp stat="ok" version="1.0">
        <prospect>
          <id>1</id>
        </prospect>
        <prospect>
          <id>2</id>
        </prospect>
      </rsp>
    XML

    delete_prospect_1_url = "#{PardotV2::PROSPECT_DELETION_URL}/1"
    delete_prospect_2_url = "#{PardotV2::PROSPECT_DELETION_URL}/2"
    # Deletion requests are only sent in production environment
    CDO.stubs(:rack_env).returns(:production)

    PardotV2.expects(:post_with_auth_retry).
      once.with(read_prospect_url).returns(pardot_response)
    PardotV2.expects(:post_with_auth_retry).
      once.with(delete_prospect_1_url)
    PardotV2.expects(:post_with_auth_retry).
      once.with(delete_prospect_2_url)

    # Deletion should succeed since deletion requests are expected to sent without errors
    assert PardotV2.delete_prospects_by_email(email)
  end

  private

  # @param str a heredoc string
  # @return Nokogiri::XML::Document
  def create_xml_from_heredoc(str)
    # Trims whitespaces at the beginning and end of each line, and delete newline characters
    # in the input before parsing. Otherwise they will pollute XML document result.
    cleaned_str = str.strip.gsub(/\s*\n\s*/, '')
    Nokogiri::XML cleaned_str
  end
end
