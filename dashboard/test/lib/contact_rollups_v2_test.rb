require 'test_helper'
require 'cdo/contact_rollups/v2/pardot'
require 'cdo/log_collector'

class ContactRollupsV2Test < ActiveSupport::TestCase
  setup do
    EmailPreference.delete_all
    User.delete_all
    ContactRollupsPardotMemory.delete_all
    ContactRollupsFinal.delete_all
  end

  teardown do
    EmailPreference.delete_all
    User.delete_all
    ContactRollupsRaw.delete_all
    ContactRollupsProcessed.delete_all
    ContactRollupsPardotMemory.delete_all
    ContactRollupsFinal.delete_all
  end

  test 'sync new contact' do
    # Create seed data in a source table
    email_preference = create :email_preference, email: 'test@domain.com', opt_in: true
    student_with_parent_email = create :student, parent_email: 'caring@parent.com'

    # Stub out Pardot responses
    PardotV2.stubs(:retrieve_prospects).
      yields([]).
      then.yields([
                    {'id' => 1, 'email' => email_preference.email},
                    {'id' => 2, 'email' => student_with_parent_email.parent_email}
                  ]
      )
    PardotV2.stubs(:submit_batch_request).once.returns([])

    # Execute the pipeline
    log_collector = LogCollector.new "Tests end-to-end pipeline"
    ContactRollupsV2.build_contact_rollups(log_collector, true)

    # Verify results

    # Email preference
    pardot_memory_record = ContactRollupsPardotMemory.find_by(email: email_preference.email, pardot_id: 1)
    refute_nil pardot_memory_record
    assert_equal({'db_Opt_In' => 'Yes'}, pardot_memory_record.data_synced)

    contact_record = ContactRollupsFinal.find_by_email(email_preference.email)
    refute_nil contact_record
    assert_equal 1, contact_record.data['opt_in']

    # Parent email
    pardot_memory_record = ContactRollupsPardotMemory.find_by(email: student_with_parent_email.parent_email, pardot_id: 2)
    refute_nil pardot_memory_record
    assert_equal({}, pardot_memory_record.data_synced)

    contact_record = ContactRollupsFinal.find_by_email(student_with_parent_email.parent_email)
    refute_nil contact_record
  end

  test 'sync updated contact' do
    # Create seed data
    email = 'test@domain.com'
    base_time = Time.now.utc
    create :email_preference, email: email, opt_in: false, updated_at: base_time

    pardot_id = 1
    create :contact_rollups_pardot_memory,
      email: email,
      pardot_id: pardot_id,
      data_synced: {db_Opt_In: 'Yes'},
      data_synced_at: base_time - 1.day

    # Stub out Pardot responses
    PardotV2.stubs(:retrieve_prospects).twice.yields([])
    PardotV2.stubs(:submit_batch_request).once.returns([])

    # Execute the pipeline
    log_collector = LogCollector.new "Tests end-to-end pipeline"
    ContactRollupsV2.build_contact_rollups(log_collector, true)

    # Verify results
    pardot_memory_record = ContactRollupsPardotMemory.find_by(email: email, pardot_id: pardot_id)
    refute_nil pardot_memory_record
    assert_equal({'db_Opt_In' => 'No'}, pardot_memory_record.data_synced)

    contact_record = ContactRollupsFinal.find_by_email(email)
    refute_nil contact_record
    assert_equal 0, contact_record.data['opt_in']
  end
end
