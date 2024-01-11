require 'test_helper'

class ApplicationControllerTest < ActionDispatch::IntegrationTest
  def setup
    Cpa.stubs(:cpa_experience).
      with(any_parameters).
      returns(Cpa::NEW_USER_LOCKOUT)
  end

  test "accounts needing permission should be locked out" do
    # Test matrix for the user states which require parent permission.
    [
      [:U13, :in_colorado, :without_parent_permission],
      [:U13, :in_colorado, :without_parent_permission, :google_sso_provider],
      [:U13, :in_colorado, :migrated_imported_from_clever, :with_google_authentication_option],
    ].each do |traits|
      user = create(:student, *traits)
      sign_in user
      get '/home'
      assert_redirected_to '/lockout', "failed to redirect to /lockout for user with traits #{traits}"
    end
  end

  test "account with permission should NOT be locked out" do
    user = create(:locked_out_child, :with_parent_permission)
    sign_in user
    get '/home'
    assert_response :success
  end

  test "accounts NOT needing permission should NOT be locked out" do
    # Test matrix for the user states which don't require parent permission.
    [
      [:student_in_word_section, :U13, :in_colorado],
      [:student_in_picture_section, :U13, :in_colorado],
      [:student, :U13, :in_colorado, :migrated_imported_from_clever],
      [:student, :U13, :unknown_us_region],
      [:student, :not_U13, :in_colorado],
    ].each do |traits|
      user = create(*traits)
      sign_in user
      get '/home'
      assert_response :success, "expected 200 response for user with traits #{traits}"
    end
  end

  test "locked out account can still sign out" do
    user = create(:locked_out_child)
    sign_in user
    sign_in user
    get '/users/sign_out'
    refute_redirect_to '/lockout'
  end

  test "locked out account can still change the language" do
    user = create(:locked_out_child)
    sign_in user
    post '/locale'
    refute_redirect_to '/lockout'
  end

  test "locked out account can access the policy consent routes" do
    user = create(:locked_out_child)
    sign_in user
    get '/policy_compliance/child_account_consent'
    refute_redirect_to '/lockout'
    post '/policy_compliance/child_account_consent'
    refute_redirect_to '/lockout'
  end

  test "an anonymous user should not be redirected to the lockout page." do
    get '/'
    refute_redirect_to '/lockout'
  end

  # Assert that the response is not a redirection to the given path.
  private def refute_redirect_to(expected_path)
    return unless response.redirect_url
    redirect_path = URI.parse(response.redirect_url).path
    failure_message = "expected response to NOT redirect to #{expected_path}."
    refute_equal expected_path, redirect_path, failure_message
  end
end
