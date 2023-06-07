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

  test "given valid token, updates user" do
    permission = create :parental_permission_request
    user = permission.user
    get '/policy_compliance/child_account_consent', params:
      {
        token: permission.uuid
      }
    user.reload
    assert_response :ok
    assert_equal User::ChildAccountCompliance::PERMISSION_GRANTED, user.child_account_compliance_state
    assert_not_empty user.child_account_compliance_state_last_updated
  end

  test "making the same request twice is ok" do
    permission = create :parental_permission_request
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
