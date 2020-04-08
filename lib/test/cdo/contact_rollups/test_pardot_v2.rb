require_relative '../../test_helper'
require 'cdo/contact_rollups/v2/pardot'

class PardotV2Test < Minitest::Test
  def test_retrieve_new_ids_without_result
    pardot_response = Nokogiri::XML <<-XML
      <rsp stat="ok">
        <result>
          <total_results>0</total_results>
        </result>
      </rsp>
    XML

    PardotV2.stubs(:post_with_auth_retry).returns(pardot_response)

    assert_equal [], PardotV2.retrieve_new_ids(0)
  end

  def test_retrieve_new_ids_with_result
    pardot_id = 1
    email = "alex@rollups.com"
    pardot_response = Nokogiri::XML <<-XML
      <rsp stat="ok">
        <result>
          <prospect>
            <id>#{pardot_id}</id>
            <email>#{email}</email>
          </prospect>
          <total_results>1</total_results>
        </result>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).returns(pardot_response)

    expected_result = [{email: email, pardot_id: pardot_id}]
    assert_equal expected_result, PardotV2.retrieve_new_ids(0)
  end

  def test_batch_create_prospects_one_contact
    contact = {email: 'crv2_test@domain.com', data: {opt_in: true}}

    ok_response = Nokogiri.XML <<-XML
      <rsp stat="ok" version="1.0">
          <errors/>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).returns(ok_response)

    submitted, errors = PardotV2.new.batch_create_prospects contact[:email], contact[:data], true

    expected_submissions = [{email: contact[:email], db_Opt_In: 'Yes'}]
    assert_equal expected_submissions, submitted
    assert_equal [], errors
  end

  def test_batch_create_prospects_multiple_contacts
    contacts = [
      {email: 'invalid_email', data: {opt_in: false}},
      {email: 'crv2_test@domain.com', data: {opt_in: true}}
    ]

    error_msg = 'Invalid prospect email address'
    response_with_errors = Nokogiri.XML <<-XML
      <rsp stat="fail" version="1.0">
          <errors>
              <prospect identifier="0">#{error_msg}</prospect>
          </errors>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).returns(response_with_errors)

    # First call, no request sent
    pardot_writer = PardotV2.new
    submitted, errors = pardot_writer.batch_create_prospects contacts.first[:email], contacts.first[:data]
    assert_equal [], submitted
    assert_equal [], errors

    # Second call, eagerly send request
    submitted, errors = pardot_writer.batch_create_prospects contacts.last[:email], contacts.last[:data], true

    expected_submissions = [
      {email: contacts.first[:email], db_Opt_In: 'No'},
      {email: contacts.last[:email], db_Opt_In: 'Yes'}
    ]
    expected_errors = [{prospect_index: 0, error_msg: error_msg}]
    assert_equal expected_submissions, submitted
    assert_equal expected_errors, errors
  end

  def test_convert_to_prospect_fields
    contact = {email: 'test@domain.com', pardot_id: 10, opt_in: true}
    expected_prospect = {email: 'test@domain.com', id: 10, db_Opt_In: 'Yes'}
    assert_equal expected_prospect, PardotV2.convert_to_prospect_fields(contact)
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

    ok_response = Nokogiri.XML <<-XML
      <rsp stat="ok" version="1.0">
          <errors/>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).returns(ok_response)

    assert_equal [], PardotV2.submit_batch_request('a_pardot_endpoint', prospects)
  end

  def test_submit_batch_request_with_errors
    prospects = [
      {email: 'test@domain.com', id: nil, db_Opt_In: 'No'}
    ]

    response_with_errors = Nokogiri.XML <<-XML
      <rsp stat="fail" version="1.0">
          <errors>
              <prospect identifier="0">Invalid prospect email address</prospect>
              <prospect identifier="1">Another error</prospect>
          </errors>
      </rsp>
    XML
    PardotV2.stubs(:post_with_auth_retry).returns(response_with_errors)

    expected_errors = [
      {prospect_index: 0, error_msg: 'Invalid prospect email address'},
      {prospect_index: 1, error_msg: 'Another error'}
    ]

    assert_equal expected_errors, PardotV2.submit_batch_request('a_pardot_endpoint', prospects)
  end
end
