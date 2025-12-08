require 'test_helper'
require 'rake'

class AdminMaintenanceTaskTest < ActiveSupport::TestCase
  setup do
    @original_execute = ENV['EXECUTE', nil]
    @original_rake = Rake.application
    Rake.application = Rake::Application.new
    Rake.application.rake_require('dashboard/lib/tasks/admin_maintenance', [Rails.root.to_s])
    Rake::Task.define_task(:environment)
  end

  teardown do
    ENV['EXECUTE'] = @original_execute
    Rake.application = @original_rake
  end

  def invoke_task
    task = Rake::Task['admin:remove_inactive_admins']
    task.reenable
    capture_io {task.invoke}
  end

  test 'dry run lists inactive admins and leaves data unchanged' do
    Timecop.freeze(Time.utc(2025, 1, 15)) do
      inactive_admin = create(:admin, current_sign_in_at: 2.years.ago)
      never_logged_admin = create(:admin, current_sign_in_at: nil)
      active_admin = create(:admin, current_sign_in_at: 1.month.ago)
      create(:teacher, current_sign_in_at: 3.years.ago)

      stdout, _stderr = invoke_task

      assert_includes stdout, "=== DRY RUN MODE ==="
      assert_includes stdout, "Would remove admin: ID: #{inactive_admin.id}"
      assert_includes stdout, "Would remove admin: ID: #{never_logged_admin.id}"
      refute_includes stdout, "ID: #{active_admin.id}"

      assert inactive_admin.reload.admin
      assert never_logged_admin.reload.admin
      assert active_admin.reload.admin
    end
  end

  test 'live mode demotes inactive teacher admins and skips non-teachers' do
    Timecop.freeze(Time.utc(2025, 1, 15)) do
      inactive_admin = create(:admin, current_sign_in_at: 2.years.ago)
      active_admin = create(:admin, current_sign_in_at: 2.days.ago)
      non_teacher_admin = create(:user, :skip_validation, admin: true, current_sign_in_at: 3.years.ago)

      ENV['EXECUTE'] = 'true'
      stdout, _stderr = invoke_task

      refute inactive_admin.reload.admin
      assert active_admin.reload.admin
      assert non_teacher_admin.reload.admin

      assert_includes stdout, "Removed admin from user #{inactive_admin.id}"
      assert_includes stdout, "Skipping user #{non_teacher_admin.id}"
      assert_includes stdout, "Errors: 1"
    end
  end

  test 'admins at the one-year cutoff are preserved' do
    Timecop.freeze(Time.utc(2025, 1, 15)) do
      boundary_time = 1.year.ago
      boundary_admin = create(:admin, current_sign_in_at: boundary_time)

      ENV['EXECUTE'] = 'true'
      stdout, _stderr = invoke_task

      assert boundary_admin.reload.admin
      refute_includes stdout, "Removed admin from user #{boundary_admin.id}"
    end
  end

  test 'continues processing when an update fails' do
    Timecop.freeze(Time.utc(2025, 1, 15)) do
      first_admin = create(:admin, current_sign_in_at: 2.years.ago)
      second_admin = create(:admin, current_sign_in_at: 2.years.ago)

      ENV['EXECUTE'] = 'true'
      User.any_instance.stubs(:update!).raises(StandardError, 'boom')

      stdout, _stderr = invoke_task

      assert first_admin.reload.admin
      assert second_admin.reload.admin
      assert_includes stdout, "Error removing admin from user #{first_admin.id}"
      assert_includes stdout, "Error removing admin from user #{second_admin.id}"
      assert_includes stdout, "Errors: 2"
    ensure
      User.any_instance.unstub(:update!)
    end
  end
end
