# frozen_string_literal: true

require 'test_helper'
require 'rake'

class AdminMaintenanceTest < ActiveSupport::TestCase
  setup do
    # Load the rake task
    Rails.application.load_tasks if Rake::Task.tasks.empty?

    # Create test users with different scenarios
    @active_admin = create(:admin)
    @active_admin.update_column(:current_sign_in_at, 6.months.ago)

    @inactive_admin_old = create(:admin)
    @inactive_admin_old.update_column(:current_sign_in_at, 2.years.ago)

    @inactive_admin_boundary = create(:admin)
    @inactive_admin_boundary.update_column(:current_sign_in_at, 1.year.ago - 1.day)

    @inactive_admin_never_logged_in = create(:admin)
    @inactive_admin_never_logged_in.update_column(:current_sign_in_at, nil)

    # Non-teacher admin: create a student with admin flag using update_column to bypass validations
    @non_teacher_admin = create(:student)
    @non_teacher_admin.update_columns(admin: true, current_sign_in_at: 2.years.ago)

    @regular_user = create(:teacher, admin: false)
    @regular_user.update_column(:current_sign_in_at, 2.years.ago)

    # Silence output during tests
    @original_stdout = $stdout
    $stdout = StringIO.new
  end

  teardown do
    # Restore stdout
    $stdout = @original_stdout
    ENV.delete('EXECUTE')
  end

  test 'dry run mode does not remove admin permissions' do
    # Verify preconditions
    assert @inactive_admin_old.reload.admin?
    assert @inactive_admin_boundary.reload.admin?
    assert @inactive_admin_never_logged_in.reload.admin?

    # Run in dry run mode (default)
    Rake::Task['admin:remove_inactive_admins'].reenable
    Rake::Task['admin:remove_inactive_admins'].invoke

    # Verify no changes were made
    assert @inactive_admin_old.reload.admin?, 'Admin should still be admin in dry run'
    assert @inactive_admin_boundary.reload.admin?, 'Admin should still be admin in dry run'
    assert @inactive_admin_never_logged_in.reload.admin?, 'Admin should still be admin in dry run'
    assert @active_admin.reload.admin?, 'Active admin should still be admin'
  end

  test 'live mode removes admin permissions from inactive users' do
    # Verify preconditions
    assert @inactive_admin_old.reload.admin?
    assert @inactive_admin_boundary.reload.admin?
    assert @inactive_admin_never_logged_in.reload.admin?

    # Run in live mode
    ENV['EXECUTE'] = 'true'
    Rake::Task['admin:remove_inactive_admins'].reenable
    Rake::Task['admin:remove_inactive_admins'].invoke

    # Verify changes were made
    refute @inactive_admin_old.reload.admin?, 'Inactive admin should have admin removed'
    refute @inactive_admin_boundary.reload.admin?, 'Inactive admin at boundary should have admin removed'
    refute @inactive_admin_never_logged_in.reload.admin?, 'Never logged in admin should have admin removed'

    # Verify active admin was not affected
    assert @active_admin.reload.admin?, 'Active admin should still be admin'
  end

  test 'respects 1 year boundary' do
    # Create user just inside the boundary (should not be removed)
    recent_user = create(:admin)
    recent_user.update_column(:current_sign_in_at, 364.days.ago)

    # Create user just past the boundary (should be removed)
    old_user = create(:admin)
    old_user.update_column(:current_sign_in_at, 366.days.ago)

    ENV['EXECUTE'] = 'true'
    Rake::Task['admin:remove_inactive_admins'].reenable
    Rake::Task['admin:remove_inactive_admins'].invoke

    # User at 364 days should still be admin (within 1 year)
    assert recent_user.reload.admin?, 'User within 1 year boundary should keep admin'

    # User at 366 days should lose admin (over 1 year)
    refute old_user.reload.admin?, 'User past 1 year boundary should lose admin'

    # User 1 day past year should also lose admin
    refute @inactive_admin_boundary.reload.admin?, 'User past boundary should lose admin'
  end

  test 'handles users who never logged in' do
    assert @inactive_admin_never_logged_in.reload.admin?
    assert_nil @inactive_admin_never_logged_in.current_sign_in_at

    ENV['EXECUTE'] = 'true'
    Rake::Task['admin:remove_inactive_admins'].reenable
    Rake::Task['admin:remove_inactive_admins'].invoke

    refute @inactive_admin_never_logged_in.reload.admin?, 'Never logged in admin should lose admin'
  end

  test 'skips non-teacher admins' do
    # Verify precondition
    assert @non_teacher_admin.reload.admin?
    refute @non_teacher_admin.teacher?

    ENV['EXECUTE'] = 'true'
    Rake::Task['admin:remove_inactive_admins'].reenable
    Rake::Task['admin:remove_inactive_admins'].invoke

    # Non-teacher admin should still be admin (skipped for data integrity)
    assert @non_teacher_admin.reload.admin?, 'Non-teacher admin should be skipped'
  end

  test 'does not affect regular users' do
    # Regular user is not admin but is also inactive
    refute @regular_user.reload.admin?
    assert @regular_user.current_sign_in_at < 1.year.ago

    ENV['EXECUTE'] = 'true'
    Rake::Task['admin:remove_inactive_admins'].reenable
    Rake::Task['admin:remove_inactive_admins'].invoke

    # Should still not be admin (no change)
    refute @regular_user.reload.admin?, 'Regular user should remain non-admin'
  end

  test 'task is idempotent - can be run multiple times safely' do
    ENV['EXECUTE'] = 'true'

    # Run the task twice
    Rake::Task['admin:remove_inactive_admins'].reenable
    Rake::Task['admin:remove_inactive_admins'].invoke

    refute @inactive_admin_old.reload.admin?

    Rake::Task['admin:remove_inactive_admins'].reenable
    Rake::Task['admin:remove_inactive_admins'].invoke

    # Should still not be admin (no errors from second run)
    refute @inactive_admin_old.reload.admin?
  end

  test 'handles empty result set gracefully' do
    # Remove all admin users first
    User.where(admin: true).update_all(admin: false)

    ENV['EXECUTE'] = 'true'
    Rake::Task['admin:remove_inactive_admins'].reenable

    # Should not raise any errors
    assert_nothing_raised do
      Rake::Task['admin:remove_inactive_admins'].invoke
    end
  end

  test 'continues processing after individual errors' do
    # Create a user that will cause validation error
    problematic_admin = create(:admin)
    problematic_admin.update_column(:current_sign_in_at, 2.years.ago)

    # Stub update! on the problematic admin to simulate a validation failure while
    # allowing the task to continue processing the remaining users.
    problematic_admin.errors.add(:admin, 'cannot be updated (test stub)')
    failure = ActiveRecord::RecordInvalid.new(problematic_admin)

    ENV['EXECUTE'] = 'true'
    Rake::Task['admin:remove_inactive_admins'].reenable

    begin
      problematic_admin.stubs(:update!).with(admin: false).raises(failure)

      # Should not raise - should continue processing
      assert_nothing_raised do
        Rake::Task['admin:remove_inactive_admins'].invoke
      end
    ensure
      problematic_admin.unstub(:update!)
    end
  end
end
