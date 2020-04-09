require 'test_helper'
require 'cdo/contact_rollups/v2/pardot'

class ContactRollupsPardotMemoryTest < ActiveSupport::TestCase
  test 'add_and_update_pardot_ids inserts new mappings' do
    ContactRollupsPardotMemory.delete_all

    new_mappings = [
      {email: "alex@rollups.com", pardot_id: 1},
      {email: "becky@rollups.com", pardot_id: 2}
    ]
    PardotV2.stubs(:retrieve_new_ids).returns(new_mappings)

    ContactRollupsPardotMemory.add_and_update_pardot_ids

    new_mappings.each do |mapping|
      refute_nil ContactRollupsPardotMemory.find_by(email: mapping[:email], pardot_id: mapping[:pardot_id])
    end
  end

  test 'add_and_update_pardot_ids updates existing mapping' do
    ContactRollupsPardotMemory.delete_all
    existing_record = create :contact_rollups_pardot_memory

    new_pardot_id = existing_record.pardot_id + 1
    PardotV2.stubs(:retrieve_new_ids).returns(
      [{email: existing_record.email, pardot_id: new_pardot_id}]
    )

    ContactRollupsPardotMemory.add_and_update_pardot_ids

    assert_equal new_pardot_id, ContactRollupsPardotMemory.find_by(email: existing_record.email)&.pardot_id
  end

  test 'update_pardot_prospects' do
    # Function under test: ContactRollupsPardotMemory.update_pardot_prospects
    # Input: processed table + pardot_memory table
    # Expected outputs/results:
    # 1. Send requests to Pardot
    #   1.1. Find all contacts with updates
    #     1.1.1 Contacts has pardot ID but never synced to pardot
    #     1.1.2 Contacts updated after the last time synced to Pardot
    #     1.1.3 Contacts have new pardot ids
    #   1.2. Calculate content of each contact to sync (delta could be none)
    #   1.3. Create batch update query
    #   1.4. Send update query
    # 2. Make changes to PardotMemory table
    #   2.1 Update successfully synced contacts: time synced, data synced
    #   2.2 Update rejected contacts: time rejected, reason

    # Test 1.1.1 + 1.1.2
    # setup:
    #   processed table:
    #     contact (a).
    #     contact (b) w/ data_updated_at > pardot data_synced_at.
    #     contact (c) w/ data_updated_at < pardot data_synced_at.
    #     contact (d)
    #     contact (e) not in pardot_memory
    #   pardot_memory table:
    #     contact (a) with pardot_id (data_synced_at = null).
    #     contact (b) w/ pardot_id + data_synced + data_synced_at.
    #     contact (c) w/ pardot_id + data_synced + data_synced_at.
    #     contact (d) w/o pardot_id
    #     contact (f) not in processed table
    # expect: find (a) & (b)

    base_time = Time.now - 2.days
    contact_list = [
      {email: 'alpha@cdo.org', pardot_id: 1, data_updated_at: base_time, data_synced_at: nil, data_synced: nil},
      {email: 'beta@cdo.org', pardot_id: 2, data_updated_at: base_time, data_synced_at: base_time - 1.day, data_synced: {}},
      {email: 'gamma@cdo.org', pardot_id: 3, data_updated_at: base_time, data_synced_at: base_time + 1.day, data_synced: {}},
      {email: 'delta@cdo.org', pardot_id: nil},
      {email: 'epsilon@cdo.org', not_in_pardot_memory_table: true},
      {email: 'zeta@cdo.org', not_in_processed_table: true},
    ]
    expected_updated_contacts = %w(alpha@cdo.org beta@cdo.org)

    contact_list.each do |contact|
      unless contact[:not_in_processed_table]
        create :contact_rollups_processed, email: contact[:email], data: {updated_at: contact[:data_updated_at]}
      end

      unless contact[:not_in_pardot_memory_table]
        create :contact_rollups_pardot_memory, contact.slice(:email, :data_synced_at, :data_synced)
      end
    end

    assert_equal expected_updated_contacts, ContactRollupsPardotMemory.update_pardot_prospects
  end

  test 'create_new_pardot_prospects' do
    assert_equal 0, ContactRollupsPardotMemory.count
    assert_equal 0, ContactRollupsProcessed.count
    PardotV2.stubs(:submit_batch_request).returns([])

    # Sync 1 contact
    processed_contacts = []
    processed_contacts << (create :contact_rollups_processed)

    ContactRollupsPardotMemory.create_new_pardot_prospects
    assert_equal processed_contacts.length, ContactRollupsPardotMemory.count

    # Sync multiple contacts
    processed_contacts.concat(create_list(:contact_rollups_processed, 2))

    ContactRollupsPardotMemory.create_new_pardot_prospects
    assert_equal processed_contacts.length, ContactRollupsPardotMemory.count
    processed_contacts.each do |contact|
      refute_nil ContactRollupsPardotMemory.find_by(email: contact.email)
    end
  end

  test 'find_updated_contacts_query' do
    assert_equal 0, ContactRollupsPardotMemory.count
    assert_equal 0, ContactRollupsProcessed.count

    base_time = Time.now - 2.days
    pardot_memory_contact_info = [
      {email: 'alpha', pardot_id: 1, data_synced_at: nil, data_synced: nil},
      {email: 'beta', pardot_id: 2, data_synced_at: base_time - 1.day, data_synced: {db_Opt_In: 'Yes'}},
      {email: 'gamma', pardot_id: 3, data_synced_at: base_time + 1.day, data_synced: {db_Opt_In: 'Yes'}},
      {email: 'delta', pardot_id: nil},
      {email: 'epsilon', pardot_id: 4},
    ]
    pardot_memory_contact_info.each do |contact_info|
      create :contact_rollups_pardot_memory, contact_info
    end

    processed_contact_info = [
      {email: 'alpha', data: {opt_in: false, updated_at: base_time}},
      {email: 'beta', data: {opt_in: false, updated_at: base_time}},
      {email: 'gamma', data: {opt_in: true, updated_at: base_time}},
      {email: 'delta'},
      {email: 'zeta'},
    ]
    processed_contact_info.each do |contact_info|
      create :contact_rollups_processed, contact_info
    end

    results = ActiveRecord::Base.connection.
      exec_query(ContactRollupsPardotMemory.find_updated_contacts_query).map do |record|
      record['email']
    end

    assert_equal %w(alpha beta), results
  end

  test 'save_sync_results new prospect' do
    assert_equal 0, ContactRollupsPardotMemory.count

    submission = {email: 'valid@domain.com', db_Opt_In: 'Yes'}
    submitted_time = Time.now

    ContactRollupsPardotMemory.save_sync_results [submission], [], submitted_time

    record = ContactRollupsPardotMemory.find_by(
      email: submission[:email],
      data_synced_at: submitted_time
    )
    expected_data_synced = submission.except(:email, :id).deep_stringify_keys
    assert_equal expected_data_synced, record&.data_synced
  end

  test 'save_sync_results updated prospect' do
    assert_equal 0, ContactRollupsPardotMemory.count
    create :contact_rollups_pardot_memory, email: 'alpha', pardot_id: 1, data_synced: nil
    create :contact_rollups_pardot_memory, email: 'beta', pardot_id: 2, data_synced: {db_Opt_In: 'No'}
    create :contact_rollups_pardot_memory, email: 'gamma', pardot_id: 3, data_synced: {db_Opt_In: 'Yes'}

    submissions = [
      {email: 'alpha', id: 1, db_Opt_In: 'Yes'},
      {email: 'beta', id: 2, db_Opt_In: 'Yes'},
      {email: 'gamma', id: 3, db_Opt_In: 'Yes'},
    ]
    submitted_time = Time.now

    ContactRollupsPardotMemory.save_sync_results submissions, [], submitted_time

    submissions.each do |submission|
      record = ContactRollupsPardotMemory.find_by(
        email: submission[:email],
        data_synced_at: submitted_time
      )
      expected_data_synced = submission.except(:email, :id).deep_stringify_keys
      assert_equal expected_data_synced, record&.data_synced
    end
  end

  test 'save_sync_results rejected contact' do
    assert_equal 0, ContactRollupsPardotMemory.count

    submissions = [{email: 'invalid_email', id: nil, db_Opt_In: 'No'}]
    errors = [{prospect_index: 0, error_msg: PardotHelpers::ERROR_INVALID_EMAIL}]
    submitted_time = Time.now

    ContactRollupsPardotMemory.save_sync_results submissions, errors, submitted_time

    refute_nil ContactRollupsPardotMemory.find_by(
      email: submissions.first[:email],
      data_rejected_reason: PardotHelpers::ERROR_INVALID_EMAIL,
      data_rejected_at: submitted_time
    )

    record = ContactRollupsPardotMemory.find_by(
      email: submissions.second[:email],
      data_synced_at: submitted_time
    )
    assert_equal({'db_Opt_in' => 'Yes'}, record&.data_synced)
  end
end
