require 'test_helper'
require 'cdo/contact_rollups/v2/pardot'

class ContactRollupsPardotMemoryTest < ActiveSupport::TestCase
  include Pd::WorkshopConstants

  setup do
    assert_equal 0, ContactRollupsPardotMemory.count
  end

  test 'download_pardot_ids inserts new mappings' do
    new_mappings = [
      {'id' => '1', 'email' => 'alex@rollups.com'},
      {'id' => '2', 'email' => 'becky@rollups.com'}
    ]
    PardotV2.stubs(:retrieve_prospects).once.yields(new_mappings)

    ContactRollupsPardotMemory.download_pardot_ids

    new_mappings.each do |mapping|
      refute_nil ContactRollupsPardotMemory.
        where(email: mapping['email'], pardot_id: mapping['id'].to_i).
        where.not(pardot_id_updated_at: nil).
        first
    end
  end

  test 'download_pardot_ids updates existing mappings' do
    email = 'test@domain.com'
    base_time = Time.now.utc - 1.day
    create :contact_rollups_pardot_memory,
      email: email,
      pardot_id: 1,
      pardot_id_updated_at: base_time

    PardotV2.stubs(:retrieve_prospects).
      once.
      yields([{'id' => '2', 'email' => email}])

    ContactRollupsPardotMemory.download_pardot_ids

    refute_nil ContactRollupsPardotMemory.
      where(email: email, pardot_id: 2).
      where("pardot_id_updated_at > ?", base_time).
      first
  end

  test 'download_pardot_prospects' do
    prospects = [
      {'id' => '1', 'email' => 'alex@rollups.com', 'db_Opt_In' => 'Yes'},
      {'id' => '2', 'email' => 'beta@rollups.com', 'db_City' => 'Seattle'},
    ]
    PardotV2.stubs(:retrieve_prospects).once.yields(prospects)

    ContactRollupsPardotMemory.download_pardot_prospects

    prospects.each do |prospect|
      record = ContactRollupsPardotMemory.
        find_by(email: prospect['email'], pardot_id: prospect['id'].to_i)

      refute_nil record
      refute_nil record.pardot_id_updated_at
      refute_nil record.data_synced_at
      assert_equal prospect.except('email', 'id'), record.data_synced
    end
  end

  test 'download_deleted_pardot_prospects' do
    deleted_prospects = [
      {'id' => '1', 'email' => 'earth@rollups.com'},
      {'id' => '2', 'email' => 'mars@rollups.com'},
      # There could be multiple prospects with the same email address, but with different pardot_id.
      {'id' => '3', 'email' => 'earth@rollups.com'}
    ]
    PardotV2.stubs(:retrieve_prospects).once.yields(deleted_prospects)

    ContactRollupsPardotMemory.download_deleted_pardot_prospects

    deleted_prospects.each do |prospect|
      record = ContactRollupsPardotMemory.find_by(email: prospect['email'])
      refute_nil record
      refute_nil record.data_rejected_at
      assert_equal PardotHelpers::ERROR_PROSPECT_DELETED_FROM_PARDOT, record.data_rejected_reason
    end
  end

  test 'query_new_contacts' do
    assert_equal 0, ContactRollupsProcessed.count

    pardot_memory_records = [
      {email: 'alpha', pardot_id: nil},
      {email: 'beta', pardot_id: 1},
      {email: 'delta', pardot_id: nil, data_rejected_reason: PardotHelpers::ERROR_INVALID_EMAIL},
      {email: 'omega', pardot_id: nil, data_rejected_reason: PardotHelpers::ERROR_PROSPECT_DELETED_FROM_PARDOT}
    ]
    pardot_memory_records.each {|record| create :contact_rollups_pardot_memory, record}

    processed_contact_records = [
      {email: 'alpha'},
      {email: 'beta'},
      {email: 'gamma'},
      {email: 'delta'},
      {email: 'omega'}
    ]
    processed_contact_records.each {|record| create :contact_rollups_processed, record}

    # Execute SQL query to find new contacts to add to Pardot
    results = ActiveRecord::Base.connection.
      exec_query(ContactRollupsPardotMemory.query_new_contacts).map do |record|
      record['email']
    end

    # Should find only 2 new contacts that don't have valid Pardot IDs and are not rejected by Pardot.
    assert_equal %w(alpha gamma), results
  end

  test 'create_new_pardot_prospects' do
    contact = create :contact_rollups_processed,
      data: {
        'opt_in' => 1,
        'user_id' => 111,
        'professional_learning_enrolled' => "#{COURSE_CSD},#{COURSE_CSF}",
        'professional_learning_attended' => COURSE_CSF,
        'hoc_organizer_years' => '2019',
        'forms_submitted' => 'Census,Petition',
        'form_roles' => 'engineer,teacher',
        'roles' => 'Form Submitter',
        'state' => 'Washington',
        'city' => 'Seattle',
        'postal_code' => '98101',
        'country' => 'United States',
      }
    refute ContactRollupsPardotMemory.find_by_email(contact.email)
    PardotV2.expects(:submit_batch_request).once.returns([])

    ContactRollupsPardotMemory.create_new_pardot_prospects

    record = ContactRollupsPardotMemory.find_by_email!(contact.email)
    expected_data_synced = {
      'db_Opt_In' => 'Yes',
      'db_Has_Teacher_Account' => 'true',
      'db_Professional_Learning_Enrolled_0' => COURSE_CSD,
      'db_Professional_Learning_Enrolled_1' => COURSE_CSF,
      'db_Professional_Learning_Attended_0' => COURSE_CSF,
      'db_Hour_of_Code_Organizer_0' => '2019',
      'db_Forms_Submitted' => 'Census,Petition',
      'db_Form_Roles' => 'engineer,teacher',
      'db_Roles_0' => 'Form Submitter',
      'db_State' => 'Washington',
      'db_City' => 'Seattle',
      'db_Postal_Code' => '98101',
      'db_Country' => 'United States',
    }
    assert_equal expected_data_synced, record[:data_synced]
  end

  test 'query_updated_contacts' do
    assert_equal 0, ContactRollupsProcessed.count

    base_time = Time.now.utc - 2.days
    pardot_memory_records = [
      {
        email: 'alpha',
        pardot_id: 1,
        pardot_id_updated_at: base_time,
        data_synced_at: nil,
        data_synced: nil
      },
      {
        email: 'beta',
        pardot_id: 2,
        pardot_id_updated_at: base_time - 2.days,
        data_synced_at: base_time - 1.day,
        data_synced: {db_Opt_In: 'Yes'}
      },
      {
        email: 'gamma',
        pardot_id: 3,
        pardot_id_updated_at: base_time + 2.days,
        data_synced_at: base_time + 1.day,
        data_synced: {db_Opt_In: 'Yes'}
      },
      {
        email: 'omega',
        pardot_id: 5,
        pardot_id_updated_at: base_time + 2.days,
        data_synced_at: base_time + 1.day,
        data_synced: {db_Opt_In: 'Yes'},
        data_rejected_reason: PardotHelpers::ERROR_PROSPECT_DELETED_FROM_PARDOT
      },
      # dummy records
      {email: 'delta', pardot_id: nil},
      {email: 'epsilon', pardot_id: 4},
    ]
    pardot_memory_records.each {|record| create :contact_rollups_pardot_memory, record}

    # 3 cases that require updating contacts, and one that doesn't (deleted prospect)
    processed_contact_records = [
      # Case 1: data_synced_at is null
      {email: 'alpha', data: {opt_in: 0}, data_updated_at: base_time},
      # Case 2: data_updated_at > data_synced_at
      {email: 'beta', data: {opt_in: 0}, data_updated_at: base_time},
      # Case 3: pardot_id_updated_at > data_synced_at
      {email: 'gamma', data: {opt_in: 1}, data_updated_at: base_time},
      # Case 4 (should be ignored): prospect has been deleted from Pardot
      {email: 'omega', data: {opt_in: 1}, data_updated_at: base_time},
      # dummy records
      {email: 'delta'},
      {email: 'zeta'},
    ]
    processed_contact_records.each {|record| create :contact_rollups_processed, record}

    # Execute SQL query
    results = ActiveRecord::Base.connection.
      exec_query(ContactRollupsPardotMemory.query_updated_contacts).map do |record|
      record.slice('email', 'pardot_id_changed')
    end

    expected_results = [
      {'email' => 'alpha', 'pardot_id_changed' => 0},
      {'email' => 'beta', 'pardot_id_changed' => 0},
      {'email' => 'gamma', 'pardot_id_changed' => 1}
    ]
    assert_equal expected_results, results
  end

  test 'update_pardot_prospects' do
    email = 'test@domain.com'
    last_sync_time = Time.now.utc - 7.days
    # current data
    create :contact_rollups_pardot_memory,
      email: email,
      data_synced: {
        'db_Opt_In' => 'No',
        'db_Professional_Learning_Attended' => COURSE_CSF
      },
      data_synced_at: last_sync_time

    # new data
    create :contact_rollups_processed,
      email: email,
      data: {
        'opt_in' => 1,
        'professional_learning_attended' => "#{COURSE_CSD},#{COURSE_CSF}",
      }

    PardotV2.expects(:submit_batch_request).once.returns([])

    ContactRollupsPardotMemory.update_pardot_prospects

    record = ContactRollupsPardotMemory.find_by_email!(email)
    expected_data_synced = {
      'db_Opt_In' => 'Yes',
      'db_Professional_Learning_Attended_0' => COURSE_CSD,
      'db_Professional_Learning_Attended_1' => COURSE_CSF
    }
    assert_equal expected_data_synced, record[:data_synced]
    assert last_sync_time < record[:data_synced_at]
  end

  test 'save_sync_results new prospect' do
    submission = {email: 'valid@domain.com', db_Opt_In: 'Yes'}
    submitted_time = Time.now.utc

    ContactRollupsPardotMemory.save_sync_results [submission], [], submitted_time

    record = ContactRollupsPardotMemory.find_by(
      email: submission[:email],
      data_synced_at: submitted_time
    )
    expected_data_synced = submission.except(:email, :id).deep_stringify_keys
    assert_equal expected_data_synced, record.data_synced
  end

  test 'save_sync_results updated prospects' do
    pardot_memory_records = [
      {email: 'alpha', pardot_id: 1, data_synced: nil},
      {email: 'beta', pardot_id: 2, data_synced: {db_Opt_In: 'No'}},
      {email: 'gamma', pardot_id: 3, data_synced: {db_Opt_In: 'Yes'}},
    ]
    pardot_memory_records.each {|record| create :contact_rollups_pardot_memory, record}

    submissions = [
      {email: 'alpha', id: 1, db_Opt_In: 'Yes'},
      {email: 'beta', id: 2, db_Opt_In: 'Yes'},
      {email: 'gamma', id: 3, db_Opt_In: 'Yes'},
    ]
    submitted_time = Time.now.utc

    ContactRollupsPardotMemory.save_sync_results submissions, [], submitted_time

    submissions.each do |submission|
      record = ContactRollupsPardotMemory.find_by(
        email: submission[:email],
        data_synced_at: submitted_time
      )
      expected_data_synced = submission.except(:email, :id).deep_stringify_keys
      assert_equal expected_data_synced, record.data_synced
    end
  end

  test 'save_sync_results rejected contact' do
    submission = {email: 'invalid_email', id: nil, db_Opt_In: 'No'}
    errors = [{prospect_index: 0, error_msg: PardotHelpers::ERROR_INVALID_EMAIL}]
    submitted_time = Time.now.utc

    ContactRollupsPardotMemory.save_sync_results [submission], errors, submitted_time

    refute_nil ContactRollupsPardotMemory.find_by(
      email: submission[:email],
      data_rejected_reason: PardotHelpers::ERROR_INVALID_EMAIL,
      data_rejected_at: submitted_time
    )
  end

  test 'delete_pardot_prospects deletes Pardot prospect and local record' do
    email_to_delete = 'hard_delete@me.com'
    create :contact_rollups_pardot_memory,
      email: email_to_delete,
      marked_for_deletion_at: Time.now.utc

    PardotV2.expects(:delete_prospects_by_email).
      once.with(email_to_delete).
      returns(true)

    ContactRollupsPardotMemory.delete_pardot_prospects
    assert_nil ContactRollupsPardotMemory.find_by_email(email_to_delete)
  end

  test 'delete_pardot_prospects does not delete local record if Pardot deletion fails' do
    email_to_delete = 'hard_delete@me.com'
    create :contact_rollups_pardot_memory,
      email: email_to_delete,
      marked_for_deletion_at: Time.now.utc

    PardotV2.expects(:delete_prospects_by_email).
      once.with(email_to_delete).
      returns(false)

    ContactRollupsPardotMemory.delete_pardot_prospects
    refute_nil ContactRollupsPardotMemory.find_by_email(email_to_delete)
  end

  test 'delete_pardot_prospects finds all contacts marked for deletion' do
    assert_equal 0, ContactRollupsPardotMemory.count
    create_list :contact_rollups_pardot_memory, 3

    contacts_to_delete = create_list :contact_rollups_pardot_memory, 2, marked_for_deletion_at: Time.now.utc
    emails_to_delete = contacts_to_delete.pluck(:email)

    PardotV2.expects(:delete_prospects_by_email).
      times(emails_to_delete.length).
      with {|email| emails_to_delete.include? email}

    ContactRollupsPardotMemory.delete_pardot_prospects
  end
end
