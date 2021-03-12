require 'test_helper'

class QueuedAccountPurgeTest < ActiveSupport::TestCase
  test "requires a user" do
    assert_raises ActiveRecord::StatementInvalid do
      QueuedAccountPurge.create(reason_for_review: 'test')
    end
  end

  test "resolve! purges the user account" do
    qap = create :queued_account_purge
    user = qap.user

    AccountPurger.any_instance.expects(:purge_data_for_account).with(user).once
    qap.resolve!
  end

  test "resolve! purges the user account when user is already soft-deleted" do
    qap = create :queued_account_purge
    user = qap.user
    user.destroy
    qap.reload

    AccountPurger.any_instance.expects(:purge_data_for_account).with(user).once
    qap.resolve!
  end

  test "resolve! deletes the QueuedAccountPurge" do
    AccountPurger.any_instance.stubs(:purge_data_for_account)

    qap = create :queued_account_purge
    refute_nil QueuedAccountPurge.find_by_id(qap.id)

    qap.resolve!
    assert_nil QueuedAccountPurge.find_by_id(qap.id)
  end

  test "resolve! does not delete the QueuedAccountPurge if purging the user fails" do
    AccountPurger.any_instance.stubs(:purge_data_for_account).raises('Test failure')

    qap = create :queued_account_purge
    refute_nil QueuedAccountPurge.find_by_id(qap.id)

    assert_raises RuntimeError do
      qap.resolve!
    end
    refute_nil QueuedAccountPurge.find_by_id(qap.id)
  end

  test "needing_manual_review normally includes everything" do
    q1 = create :queued_account_purge
    q2 = create :queued_account_purge
    assert_includes QueuedAccountPurge.needing_manual_review, q1
    assert_includes QueuedAccountPurge.needing_manual_review, q2
  end

  test "needing_manual_review omits Net::ReadTimeout" do
    q1 = create :queued_account_purge
    q2 = create :queued_account_purge, reason_for_review: 'Net::ReadTimeout'
    assert_includes QueuedAccountPurge.needing_manual_review, q1
    refute_includes QueuedAccountPurge.needing_manual_review, q2
  end

  test "clean_up_resolved_purges drops records for purged users" do
    # This one should get cleaned up
    q1 = create(:queued_account_purge, user: create(:student, deleted_at: Time.now, purged_at: Time.now))
    # This one should not
    q2 = create(:queued_account_purge)

    ids = [q1, q2].map(&:id)
    assert_equal [q1.id, q2.id], QueuedAccountPurge.where(id: ids).pluck(:id)

    QueuedAccountPurge.clean_up_resolved_records!
    assert_equal [q2.id], QueuedAccountPurge.where(id: ids).pluck(:id)
  end
end
