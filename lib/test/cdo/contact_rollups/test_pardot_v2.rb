require_relative '../../test_helper'
require 'cdo/contact_rollups/v2/pardot'

class PardotV2Test < Minitest::Test
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

  def create_query_url_with_deleted_prospects
    expected_url = "#{PardotV2::PROSPECT_QUERY_URL}?output=bulk&id_greater_than=0&fields=id,email&sort_by=id&deleted=true"

    assert_equal expected_url, PardotV2.create_query_url(0, %w(id email), nil, true)
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
    submitted, errors = PardotV2.new.batch_create_prospects contact[:email], contact[:data], true

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

    # Eagerly submit an update request
    submissions, errors = PardotV2.new.batch_update_prospects(
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

  def test_convert_to_pardot_prospect
    contacts = [
      {email: 'test0@domain.com', pardot_id: 10, opt_in: 1},
      {email: 'test1@domain.com', pardot_id: nil, bad_key: true}
    ]
    expected_prospects = [
      {email: 'test0@domain.com', id: 10, db_Opt_In: 'Yes'},
      {email: 'test1@domain.com', id: nil}
    ]

    contacts.each_with_index do |contact, index|
      assert_equal expected_prospects[index], PardotV2.convert_to_pardot_prospect(contact)
    end
  end

  def test_extract_prospect_from_response
    fields = %w(email id db_Opt_In db_Roles)
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
          </prospect>
        </result>
      </rsp>
    XML

    expected_prospect = {
      'id' => '1',
      'email' => 'test@domain.com',
      'db_Opt_In' => 'Yes',
      'db_Roles_0' => 'Teacher',
      'db_Roles_1' => 'CSF Teacher'
    }

    prospect_node = doc.xpath('/rsp/result/prospect').first
    prospect = PardotV2.extract_prospect_from_response(prospect_node, fields)

    assert_equal expected_prospect, prospect
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
      {old_data: {k1: 'v1'}, new_data: {}, expected_delta: {k1: nil}},
      {old_data: {k1: 'v1'}, new_data: {k1: 'v1'}, expected_delta: {}},
      {old_data: {k1: 'v1'}, new_data: {k1: 'v1.1'}, expected_delta: {k1: 'v1.1'}},
      {old_data: {k1: 'v1'}, new_data: {k2: 'v2'}, expected_delta: {k1: nil, k2: 'v2'}},
      {old_data: {k1: nil}, new_data: {k2: 'v2'}, expected_delta: {k2: 'v2'}},
      {
        old_data: {k1: 'v1', k2: 'v2', k3: nil},
        new_data: {k1: 'v1.1', k4: 'v4'},
        expected_delta: {k1: 'v1.1', k2: nil, k4: 'v4'}
      },
    ]

    tests.each_with_index do |test, index|
      delta = PardotV2.calculate_data_delta test[:old_data], test[:new_data]
      assert_equal test[:expected_delta], delta, "Test index #{index} failed"
    end
  end

  # @param str a heredoc string
  # @return Nokogiri::XML::Document
  def create_xml_from_heredoc(str)
    # Trims whitespaces at the beginning and end of each line, and delete newline characters
    # in the input before parsing. Otherwise they will pollute XML document result.
    cleaned_str = str.strip.gsub(/\s*\n\s*/, '')
    Nokogiri::XML cleaned_str
  end
end
