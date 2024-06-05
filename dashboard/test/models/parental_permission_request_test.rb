require "test_helper"

class ParentalPermissionRequestTest < ActiveSupport::TestCase
  class CAPEventLogging < ActiveSupport::TestCase
    setup do
      @student = create(:non_compliant_child)
    end

    test 'logs CAP event "parent_email_submit" after creating when it is first request of student' do
      Services::ChildAccount::EventLogger.expects(:log_parent_email_submit).with(@student).once

      create(:parental_permission_request, user: @student)
    end

    test 'logs CAP event "parent_email_update" after creating when it is not first request of student' do
      create(:parental_permission_request, user: @student)

      Services::ChildAccount::EventLogger.expects(:log_parent_email_update).with(@student).once

      create(:parental_permission_request, user: @student)
    end

    test 'does not log any CAP events after update' do
      parental_permission_request = create(:parental_permission_request, user: @student)

      Services::ChildAccount::EventLogger.expects(:new).with(user: @student, event_name: anything).never

      parental_permission_request.save!
    end
  end

  test "UUIDs should exist" do
    request = create(:parental_permission_request)
    refute_nil request.uuid
  end

  test "required inputs are required" do
    refute build(:parental_permission_request, user: nil).valid? "user is required"
    refute build(:parental_permission_request, parent_email: nil).valid? "parent email is required"
  end
end
