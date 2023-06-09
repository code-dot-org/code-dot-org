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
    assert_equal User::ChildAccountCompliance::PERMISSION_GRANTED, user.child_account_compliance_state
    assert_not_empty user.child_account_compliance_state_last_updated
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
end
