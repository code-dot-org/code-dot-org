require 'test_helper'

class Forms::ChildAccount::ParentalPermissionRequestTest < ActiveSupport::TestCase
  class SuccessTest < ActiveSupport::TestCase
    setup do
      @child_account = create(:student)
      @parent_email = 'parent@email.com'

      @permission_request_form = Forms::ChildAccount::ParentalPermissionRequest.new(
        child_account: @child_account,
        parent_email: @parent_email,
      )
    end

    test 'creates and returns new parental permission request record' do
      assert_creates(ParentalPermissionRequest) do
        assert @permission_request_form.request
        assert_attributes @permission_request_form.record, {
          id: :not_nil,
          uuid: :not_empty,
          user: @child_account,
          parent_email: @parent_email,
          resends_sent: 0,
        }
      end
    end

    test 'updates and returns existing parental permission request resends count' do
      permission_request = create(:parental_permission_request, user: @child_account, parent_email: @parent_email)

      assert_difference -> {permission_request.reload.resends_sent}, 1 do
        assert @permission_request_form.request
        assert_equal permission_request, @permission_request_form.record
      end
    end

    test 'sends permission request email to parent' do
      uuid = 'expected_parental_permission_request_uuid'

      @permission_request_form.record.stubs(:uuid).returns(uuid)

      ParentMailer.
        expects(:parent_permission_request).
        with(@parent_email, "http://test-studio.code.org/policy_compliance/child_account_consent?token=#{uuid}").
        returns(mock(deliver_now: true))

      assert @permission_request_form.request
    end
  end

  class ValidationTest < ActiveSupport::TestCase
    setup do
      @child_account = build(:student)
      @parent_email = 'parent@email.com'
    end

    test 'validates child account presence' do
      permission_request_form = Forms::ChildAccount::ParentalPermissionRequest.new(
        child_account: nil,
        parent_email: @parent_email,
      )

      refute permission_request_form.request
      assert_equal ["Child account can't be blank"], permission_request_form.errors.full_messages
    end

    test 'validates parent email presence' do
      permission_request_form = Forms::ChildAccount::ParentalPermissionRequest.new(
        child_account: @child_account,
        parent_email: nil,
      )

      refute permission_request_form.request
      assert_equal ["Parent email can't be blank"], permission_request_form.errors.full_messages
    end

    test 'validates parent email has correct format' do
      invalid_email = 'invalid@email'

      permission_request_form = Forms::ChildAccount::ParentalPermissionRequest.new(
        child_account: @child_account,
        parent_email: invalid_email,
      )

      refute permission_request_form.request
      assert_equal ["The parent/guardian's email address is invalid"], permission_request_form.errors.full_messages
    end

    test 'validates permission has not yet been granted' do
      Services::ChildAccount.update_compliance(@child_account, Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED)

      permission_request_form = Forms::ChildAccount::ParentalPermissionRequest.new(
        child_account: @child_account,
        parent_email: @parent_email,
      )

      refute permission_request_form.request
      assert_equal ["Parental permission has already been granted"], permission_request_form.errors.full_messages
    end

    test 'validates that provided parent email is not child own email' do
      child_email = 'child@email.com'

      @child_account.update!(email: child_email)
      @parent_email = child_email

      permission_request_form = Forms::ChildAccount::ParentalPermissionRequest.new(
        child_account: @child_account,
        parent_email: @parent_email,
      )

      refute permission_request_form.request
      assert_equal ["A request cannot be sent to your own email address"], permission_request_form.errors.full_messages
    end

    test 'validates whether limit for resend requests has not been reached' do
      create(
        :parental_permission_request,
        user: @child_account,
        parent_email: @parent_email,
        resends_sent: Policies::ChildAccount::MAX_PARENT_PERMISSION_RESENDS.pred
      )

      permission_request_form = Forms::ChildAccount::ParentalPermissionRequest.new(
        child_account: @child_account,
        parent_email: @parent_email,
      )

      refute permission_request_form.request
      assert_equal ["The limit for resend requests has been reached"], permission_request_form.errors.full_messages
    end

    test 'validates whether daily request limit has not been reached' do
      Policies::ChildAccount::MAX_STUDENT_DAILY_PARENT_PERMISSION_REQUESTS.times do |i|
        create(:parental_permission_request, user: @child_account, parent_email: "parent#{i}@example.com")
      end

      create_list(
        :parental_permission_request,
        Policies::ChildAccount::MAX_STUDENT_DAILY_PARENT_PERMISSION_REQUESTS,
        user: @child_account,
      )

      permission_request_form = Forms::ChildAccount::ParentalPermissionRequest.new(
        child_account: @child_account,
        parent_email: @parent_email,
      )

      refute permission_request_form.request
      assert_equal ["The daily request limit has been reached"], permission_request_form.errors.full_messages
    end
  end

  class FailureTest < ActiveSupport::TestCase
    setup do
      @child_account = create(:student)
      @parent_email = 'parent@email.com'

      @permission_request_form = Forms::ChildAccount::ParentalPermissionRequest.new(
        child_account: @child_account,
        parent_email: @parent_email,
      )
    end

    test 'does not create new request record when sending request ends with an error' do
      expected_mail_error = 'expected_mail_error'
      ParentMailer.expects(:parent_permission_request).raises(expected_mail_error)

      assert_no_difference 'ParentalPermissionRequest.count' do
        assert_raises(expected_mail_error) {@permission_request_form.request}
      end
    end

    test 'does not update existing permission request resends count when sending request ends with an error' do
      permission_request = create(:parental_permission_request, user: @child_account, parent_email: @parent_email)

      expected_mail_error = 'expected_mail_error'
      ParentMailer.expects(:parent_permission_request).raises(expected_mail_error)

      assert_no_difference -> {permission_request.reload.resends_sent} do
        assert_raises(expected_mail_error) {@permission_request_form.request}
      end
    end

    test 'does not update child account compliance state when sending request ends with an error' do
      expected_mail_error = 'expected_mail_error'
      ParentMailer.expects(:parent_permission_request).raises(expected_mail_error)

      assert_no_change -> {@child_account.reload.cap_state}  do
        assert_raises(expected_mail_error) {@permission_request_form.request}
      end
    end
  end
end
