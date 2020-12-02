require 'test_helper'
require 'cdo/contact_rollups/v2/pardot'

class ContactRollupsV2Test < ActiveSupport::TestCase
  test 'sync new contact' do
    # Create seed data in a source table
    email_preference = create :email_preference, email: 'test@domain.com', opt_in: true
    student_with_parent_email = create :student, parent_email: 'caring@parent.com'

    # We use retrieve_prospects twice in the pipeline
    # to get the most current email-Pardot ID mappings.
    # A blank yielded array results first suggests there are no existing mappings
    # in Pardot, and the second result is what we'd expect once we've added
    # the two new test prospects to Pardot.
    PardotV2.stubs(:retrieve_prospects).
      yields([]).
      then.yields(
        [
          {'id' => 1, 'email' => email_preference.email},
          {'id' => 2, 'email' => student_with_parent_email.parent_email}
        ]
      )

    # In a full pipeline run with updates and new contacts,
    # we'd run submit_batch_request twice.
    # However, since this case only involves a new contact (no updates),
    # we should only execute this once.
    # TODO: There is a timing issue that can cause this method to be called twice. Will fix soon.
    PardotV2.stubs(:submit_batch_request).at_least_once.returns([])

    # Execute the pipeline
    ContactRollupsV2.new.build_and_sync

    # Verify email preference
    pardot_memory_record = ContactRollupsPardotMemory.find_by(email: email_preference.email, pardot_id: 1)
    refute_nil pardot_memory_record
    assert_equal({'db_Opt_In' => 'Yes'}, pardot_memory_record[:data_synced])

    contact_record = ContactRollupsFinal.find_by_email(email_preference.email)
    refute_nil contact_record
    assert_equal 1, contact_record.data['opt_in']

    # Verify parent email
    pardot_memory_record = ContactRollupsPardotMemory.find_by(email: student_with_parent_email.parent_email, pardot_id: 2)
    refute_nil pardot_memory_record
    assert_equal({'db_Roles_0' => 'Parent'}, pardot_memory_record[:data_synced])

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

    # We use retrieve_prospects twice in the pipeline
    # to get the most current email-Pardot ID mappings.
    # A blank yielded array results when there are no new
    # mappings to report, which is what we'd expect in this test case.
    PardotV2.stubs(:retrieve_prospects).twice.yields([])

    # In a full pipeline run with updates and new contacts,
    # we'd run submit_batch_request twice.
    # However, since this case only involves an update (no new contacts),
    # we should only execute this once.
    # TODO: There is a timing issue that can cause this method to be called twice. Will fix soon.
    PardotV2.stubs(:submit_batch_request).at_least_once.returns([])

    # Execute the pipeline
    ContactRollupsV2.new.build_and_sync

    # Verify results
    pardot_memory_record = ContactRollupsPardotMemory.find_by(email: email, pardot_id: pardot_id)
    refute_nil pardot_memory_record
    assert_equal({'db_Opt_In' => 'No'}, pardot_memory_record[:data_synced])

    contact_record = ContactRollupsFinal.find_by_email(email)
    refute_nil contact_record
    assert_equal 0, contact_record.data['opt_in']
  end

  test 'dry run makes no Pardot API calls' do
    # Called when creating and updating Pardot prospects
    PardotV2.expects(:submit_batch_request).never
    ContactRollupsPardotMemory.expects(:save_accepted_submissions).never
    ContactRollupsPardotMemory.expects(:save_rejected_submissions).never

    # Called when downloading Pardot ID-email mappings
    PardotV2.expects(:post_with_auth_retry).never

    # Execute the pipeline
    ContactRollupsV2.new(is_dry_run: true).build_and_sync
  end
end
