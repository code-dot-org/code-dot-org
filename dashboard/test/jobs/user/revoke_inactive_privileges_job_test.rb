require 'test_helper'

class User::RevokeInactivePrivilegesJobTest < ActiveJob::TestCase
  setup do
    ChatClient.stubs(:message)
  end

  def set_sign_in(user, created_at: 2.years.ago, current_sign_in_at: nil, last_sign_in_at: nil)
    user.update_columns(created_at:, current_sign_in_at:, last_sign_in_at:)
    user
  end

  def create_admin(**sign_in)
    set_sign_in(create(:admin), **sign_in)
  end

  def create_levelbuilder(granted_at: 2.years.ago, **sign_in)
    user = create(:teacher)
    user.permission = UserPermission::LEVELBUILDER
    UserPermission.where(user_id: user.id).update_all(created_at: granted_at)
    set_sign_in(user, **sign_in)
  end

  def levelbuilder?(user)
    UserPermission.exists?(user_id: user.id, permission: UserPermission::LEVELBUILDER)
  end

  test 'revokes admin whose latest sign-in is older than the cutoff' do
    admin = create_admin(current_sign_in_at: 13.months.ago, last_sign_in_at: 2.years.ago)

    User::RevokeInactivePrivilegesJob.perform_now

    refute admin.reload.admin?
  end

  test 'keeps admin who signed in recently after a long absence' do
    admin = create_admin(current_sign_in_at: 1.day.ago, last_sign_in_at: 2.years.ago)

    User::RevokeInactivePrivilegesJob.perform_now

    assert admin.reload.admin?
  end

  test 'keeps admin signed in within the cutoff' do
    admin = create_admin(current_sign_in_at: 6.months.ago)

    User::RevokeInactivePrivilegesJob.perform_now

    assert admin.reload.admin?
  end

  test 'revokes admin who never signed in and was created before the cutoff' do
    admin = create_admin

    User::RevokeInactivePrivilegesJob.perform_now

    refute admin.reload.admin?
  end

  test 'keeps admin who never signed in and was created after the cutoff' do
    admin = create_admin(created_at: 1.day.ago)

    User::RevokeInactivePrivilegesJob.perform_now

    assert admin.reload.admin?
  end

  test 'revokes levelbuilder from inactive account' do
    user = create_levelbuilder(current_sign_in_at: 13.months.ago)

    User::RevokeInactivePrivilegesJob.perform_now

    refute levelbuilder?(user)
    assert user.reload.persisted?
  end

  test 'keeps levelbuilder for active account' do
    user = create_levelbuilder(current_sign_in_at: 1.day.ago)

    User::RevokeInactivePrivilegesJob.perform_now

    assert levelbuilder?(user)
  end

  test 'keeps recent levelbuilder grant on an inactive account' do
    user = create_levelbuilder(granted_at: 1.day.ago)

    User::RevokeInactivePrivilegesJob.perform_now

    assert levelbuilder?(user)
  end

  test 'keeps other permissions on an inactive account' do
    user = create_levelbuilder
    user.permission = UserPermission::FACILITATOR

    User::RevokeInactivePrivilegesJob.perform_now

    refute levelbuilder?(user)
    assert UserPermission.exists?(user_id: user.id, permission: UserPermission::FACILITATOR)
  end

  test 'continues past a failure and reports it' do
    admin = create_admin
    levelbuilder = create_levelbuilder
    User.any_instance.stubs(:update_attribute).raises(ActiveRecord::StatementInvalid)
    ChatClient.expects(:message).with('cron-daily', regexp_matches(/levelbuilder from 1 accounts.* 1 failed/), color: 'red')

    User::RevokeInactivePrivilegesJob.perform_now

    assert admin.reload.admin?
    refute levelbuilder?(levelbuilder)
  end

  test 'posts the counts to Slack' do
    create_admin
    create_admin(current_sign_in_at: 13.months.ago)
    create_levelbuilder
    ChatClient.expects(:message).with('cron-daily', regexp_matches(/admin from 2 and levelbuilder from 1 accounts/))

    User::RevokeInactivePrivilegesJob.perform_now
  end

  test 'posts nothing when nothing is revoked' do
    create_admin(current_sign_in_at: 1.day.ago)
    ChatClient.expects(:message).never

    User::RevokeInactivePrivilegesJob.perform_now
  end

  test 'dry run changes nothing' do
    admin = create_admin
    user = create_levelbuilder
    ChatClient.expects(:message).never

    User::RevokeInactivePrivilegesJob.perform_now(dry_run: true)

    assert admin.reload.admin?
    assert levelbuilder?(user)
  end
end
