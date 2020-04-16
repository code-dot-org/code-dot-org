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

    PardotV2.stubs(:post_with_auth_retry).once.returns(pardot_response)

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
    PardotV2.stubs(:post_with_auth_retry).once.returns(pardot_response)

    expected_result = [{email: email, pardot_id: pardot_id}]
    assert_equal expected_result, PardotV2.retrieve_new_ids(0)
  end

  def test_batch_create_prospects_single_contact
    contact = {email: 'crv2_test@domain.com', data: {opt_in: true}}

    ok_response = Nokogiri.XML <<-XML
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
      {email: 'invalid_email', data: {opt_in: false}},
      {email: 'crv2_test@domain.com', data: {opt_in: true}}
    ]

    response_with_errors = Nokogiri.XML <<-XML
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
      new_contact_data: {opt_in: false}
    }

    ok_response = Nokogiri.XML <<-XML
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
        new_contact_data: {opt_in: false}
      },
      {
        email: 'beta@cdo.org',
        pardot_id: 2,
        old_prospect_data: nil,
        new_contact_data: {opt_in: true}
      }
    ]

    response_with_errors = Nokogiri.XML <<-XML
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
      {email: 'test0@domain.com', pardot_id: 10, opt_in: true},
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
    PardotV2.stubs(:post_with_auth_retry).once.returns(ok_response)

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
end
