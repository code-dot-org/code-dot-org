require 'test_helper'

class PolicyComplianceControllerTest < ActionDispatch::IntegrationTest
  test "given no token, return bad request" do
    get '/policy_compliance/child_account_consent', params: {}
    assert_response :bad_request
  end

  test "given unknown token, return bad request" do
    get '/policy_compliance/child_account_consent', params:
      {
        token: '7d444840-7b8a-4f7b-8351-6fa724a5a384'
      }
    assert_response :bad_request
  end

  test "given valid token, updates user and sends email" do
    permission = create :parental_permission_request
    user = permission.user
    assert_emails 1 do
      get '/policy_compliance/child_account_consent', params:
        {
          token: permission.uuid
        }
    end
    user.reload
    assert_response :ok
    assert_equal Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED, user.cap_status
    refute_nil user.cap_status_date
  end

  test "making the same request twice is ok and email is sent once" do
    # We want to make sure an email isn't sent every time the URL is visited.
    permission = create :parental_permission_request
    assert_emails 1 do
      get '/policy_compliance/child_account_consent', params:
        {
          token: permission.uuid
        }
      assert_response :ok
      get '/policy_compliance/child_account_consent', params:
        {
          token: permission.uuid
        }
      assert_response :ok
    end
  end

  test "must authenticate user when submitting parental permission request" do
    post '/policy_compliance/child_account_consent', params:
      {
        'parent-email': 'parent@example.com',
      }
    assert_redirected_to new_user_session_path
  end

  test "must provide a parent email to the request api" do
    user = create(:young_student, :without_parent_permission)
    sign_in user

    post '/policy_compliance/child_account_consent', params: {}
    assert_response :bad_request
  end

  test "given a user already has parental permission, should just redirect back" do
    permission = create :parental_permission_request, :granted
    user = permission.user
    user.cap_status = Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED

    sign_in user

    assert_emails 0 do
      post '/policy_compliance/child_account_consent', params:
        {
          'parent-email': permission.parent_email,
        }
      assert_redirected_to lockout_path
    end
  end

  test "if a user enters their own email as their parent email, should just redirect back" do
    user = create(:young_student, :without_parent_permission, email: 'test@studentemail.com')
    sign_in user

    assert_emails 0 do
      post '/policy_compliance/child_account_consent', params:
        {
          'parent-email': 'test@studentemail.com',
        }
      assert_redirected_to lockout_path
    end
  end

  test "if a user enters their own email with a subaddress/plus address, it should redirect back" do
    user = create(:young_student, :without_parent_permission, email: 'test@studentemail.com')
    sign_in user

    assert_emails 0 do
      post '/policy_compliance/child_account_consent', params:
        {
          'parent-email': 'test+foo@studentemail.com',
        }
      assert_redirected_to lockout_path
    end
  end

  test "if a user enters an invalid email, it should return a 400" do
    user = create(:young_student, :without_parent_permission)
    sign_in user

    post '/policy_compliance/child_account_consent', params:
      {
        'parent-email': 'bademail',
      }
    assert_response :bad_request
  end

  test "should send an email to the parent upon creating the request" do
    user = create(:young_student, :without_parent_permission)
    sign_in user

    assert_emails 1 do
      post '/policy_compliance/child_account_consent', params:
        {
          'parent-email': 'parent@example.com',
        }
      assert_redirected_to lockout_path
    end
  end

  test "given a user already has sent a parental permission, should resend if specifying the same email" do
    permission = create :parental_permission_request
    user = permission.user

    sign_in user

    assert_emails 1 do
      post '/policy_compliance/child_account_consent', params:
        {
          'parent-email': permission.parent_email,
        }
      assert_redirected_to lockout_path
    end
  end

  test "given a user already has sent a parental permission, should still send if child specifies a different one" do
    permission = create :parental_permission_request
    user = permission.user

    sign_in user

    assert_emails 1 do
      post '/policy_compliance/child_account_consent', params:
        {
          'parent-email': 'parent@differentemail.com',
        }
      assert_redirected_to lockout_path
    end
  end

  test "given a user already has sent a parental permission, should just redirect and not send email after the third time" do
    user = create(:young_student, :without_parent_permission
)
    sign_in user

    assert_emails 3 do
      4.times do
        post '/policy_compliance/child_account_consent', params:
          {
            'parent-email': 'parent@example.com',
          }
        assert_redirected_to lockout_path
      end
    end
  end

  test "a user should not be able to send more than 3 unique parental request emails per day" do
    user = create(:young_student, :without_parent_permission
)
    sign_in user

    assert_emails 3 do
      4.times do |i|
        post '/policy_compliance/child_account_consent', params:
          {
            'parent-email': "parent#{i}@example.com",
          }
        assert_redirected_to lockout_path
      end
    end
  end

  test "a user should be able to send a new request the following day" do
    # Create existing permission requests
    permission = create :parental_permission_request, :old
    create :parental_permission_request, :old, parent_email: 'parent_second@example.com', user: permission.user
    create :parental_permission_request, :old, parent_email: 'parent_third@example.com', user: permission.user

    # Sign in
    user = permission.user
    sign_in user

    # Do a new email
    assert_emails 1 do
      post '/policy_compliance/child_account_consent', params:
        {
          'parent-email': "parent_newest@example.com",
        }
      assert_redirected_to lockout_path
    end
  end

  test "registration email should be given a fully qualified path to the token endpoint" do
    user = create(:young_student, :without_parent_permission)
    sign_in user

    post '/policy_compliance/child_account_consent', params:
      {
        'parent-email': "parent@example.com",
      }
    assert_redirected_to lockout_path

    mail = ActionMailer::Base.deliveries.first
    token_endpoint_url = url_for(
      action: :child_account_consent,
      controller: :policy_compliance,
      only_path: false,
      protocol: Rails.application.routes.default_url_options[:protocol],
    )
    assert_includes(mail.body.to_s, token_endpoint_url)
  end

  class PendingPermissionRequestTest < ActionDispatch::IntegrationTest
    test 'json format - returns pending permission request data when exists' do
      consent_status = 'p'
      user = create(:young_student, cap_status: consent_status)
      parent_email = 'parent@example.com'
      requested_at = DateTime.now.utc.iso8601(3)
      resends_sent = 999

      parental_permission_request = build(
        :parental_permission_request,
        user: user,
        parent_email: parent_email,
        updated_at: requested_at,
        resends_sent: resends_sent
      )

      user.expects(:latest_parental_permission_request).returns(parental_permission_request)

      sign_in user
      get policy_compliance_pending_permission_request_path, as: :json

      assert_response :success
      assert_equal JSON.dump(
        parent_email: parent_email,
        requested_at: requested_at,
        resends_sent: resends_sent,
        consent_status: consent_status,
      ), response.body
    end

    test 'json format - returns no content when no pending permission request' do
      user = create(:young_student)

      user.expects(:latest_parental_permission_request).returns(nil)

      sign_in user
      get policy_compliance_pending_permission_request_path, as: :json

      assert_response :no_content
    end
  end

  class ChildAccountConsentRequest < ActionDispatch::IntegrationTest
    test 'json format - returns permission request data on success' do
      consent_status = 'p'
      child_account = create(:young_student, cap_status: consent_status)
      parent_email = 'parent@example.com'
      requested_at = DateTime.now.utc.iso8601(3)
      resends_sent = 999

      expected_permission_request = build_stubbed(
        :parental_permission_request,
        user: child_account,
        parent_email: parent_email,
        updated_at: requested_at,
        resends_sent: resends_sent,
      )

      Forms::ChildAccount::ParentalPermissionRequest.
        expects(:new).
        with(child_account: child_account, parent_email: parent_email).
        returns(mock(request: true, record: expected_permission_request))

      sign_in child_account
      post policy_compliance_child_account_consent_path, as: :json, params: {'parent-email': parent_email}

      assert_response :created
      assert_equal JSON.dump(
        parent_email: parent_email,
        requested_at: requested_at,
        resends_sent: resends_sent,
        consent_status: consent_status,
      ), response.body
    end

    test 'json format - returns error message on failure' do
      child_account = build(:young_student)
      parent_email = 'parent@example.com'
      error_message = 'error_message'

      Forms::ChildAccount::ParentalPermissionRequest.
        expects(:new).
        with(child_account: child_account, parent_email: parent_email).
        returns(mock(request: false, errors: stub(full_messages: [error_message])))

      sign_in child_account
      post policy_compliance_child_account_consent_path, as: :json, params: {'parent-email': parent_email}

      assert_response :unprocessable_entity
      assert_equal JSON.dump(error: error_message), response.body
    end
  end
end
