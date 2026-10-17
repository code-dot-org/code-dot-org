require 'test_helper'

class User::DemoteExpiredAdminsJobTest < ActiveJob::TestCase
  setup do
    ChatClient.stubs(:message)
  end

  def create_admin(created_at: 1.year.ago, current_sign_in_at: nil, last_sign_in_at: nil)
    create(:admin).tap do |user|
      user.update_columns(created_at:, current_sign_in_at:, last_sign_in_at:)
    end
  end

  test 'demotes admin whose latest sign-in is older than the cutoff' do
    admin = create_admin(current_sign_in_at: 100.days.ago, last_sign_in_at: 200.days.ago)

    User::DemoteExpiredAdminsJob.perform_now

    refute admin.reload.admin?
  end

  test 'keeps admin who signed in recently after a long absence' do
    admin = create_admin(current_sign_in_at: 1.day.ago, last_sign_in_at: 200.days.ago)

    User::DemoteExpiredAdminsJob.perform_now

    assert admin.reload.admin?
  end

  test 'demotes admin who never signed in and was created before the cutoff' do
    admin = create_admin

    User::DemoteExpiredAdminsJob.perform_now

    refute admin.reload.admin?
  end

  test 'keeps admin who never signed in and was created after the cutoff' do
    admin = create_admin(created_at: 1.day.ago)

    User::DemoteExpiredAdminsJob.perform_now

    assert admin.reload.admin?
  end

  test 'posts the count to Slack' do
    create_admin
    create_admin(current_sign_in_at: 100.days.ago)
    ChatClient.expects(:message).with('cron-daily', regexp_matches(/for 2 accounts/))

    User::DemoteExpiredAdminsJob.perform_now
  end

  test 'posts nothing when no admin is demoted' do
    create_admin(current_sign_in_at: 1.day.ago)
    ChatClient.expects(:message).never

    User::DemoteExpiredAdminsJob.perform_now
  end

  test 'dry run changes nothing' do
    admin = create_admin
    ChatClient.expects(:message).never

    User::DemoteExpiredAdminsJob.perform_now(dry_run: true)

    assert admin.reload.admin?
  end
end
