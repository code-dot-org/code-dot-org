require 'test_helper'

class PolicyComplianceControllerTest < ActionDispatch::IntegrationTest
  test "given no token, return bad request" do
    get '/policy_compliance/new_student_account_consent', params: {}
    assert_response :bad_request
  end

  test "given unknown token, return bad request" do
    get '/policy_compliance/new_student_account_consent', params:
      {
        token: '7d444840-7b8a-4f7b-8351-6fa724a5a384'
      }
    assert_response :bad_request
  end

  test "given valid token, updates user" do
    permission = create :parental_permission_request
    user = permission.user
    get '/policy_compliance/new_student_account_consent', params:
      {
        token: permission.uuid
      }
    user.reload
    assert_response :ok
    assert_equal User::CpaCompliance::PERMISSION_GRANTED, user.cpa_compliance
    assert_not_empty user.cpa_compliance_date
  end

  test "making the same request twice is ok" do
    permission = create :parental_permission_request
    get '/policy_compliance/new_student_account_consent', params:
      {
        token: permission.uuid
      }
    assert_response :ok
    get '/policy_compliance/new_student_account_consent', params:
      {
        token: permission.uuid
      }
    assert_response :ok
  end
end
