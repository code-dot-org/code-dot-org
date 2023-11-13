require 'test_helper'

class PasswordsControllerTest < ActionController::TestCase
  setup do
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  test "new" do
    get :new
    assert_response :success
  end

  test "new allows admins" do
    sign_in create(:admin)
    get :new
    assert_response :success
  end

  test "new does not allow non-admins" do
    sign_in create(:teacher)

    get :new
    assert_response :redirect
  end

  test "create with valid email says it works" do
    create :user, email: 'anemail@email.xx'
    post :create, params: {user: {email: 'anemail@email.xx'}}

    assert_redirected_to '/users/sign_in'

    assert_equal 'You will receive an email with instructions about how to reset your password in a few minutes.', flash[:notice]
  end

  test "create with valid email includes link for admin" do
    sign_in create(:admin)
    @request.host = CDO.dashboard_hostname

    create :user, email: 'anemail@email.xx'
    post :create, params: {user: {email: 'anemail@email.xx'}}

    assert_redirected_to '/users/password/new'

    assert_includes(flash[:notice], 'Reset password link sent to user. You may also send this link directly:')
    assert_includes(flash[:notice], 'http://test-studio.code.org/users/password/edit?reset_password_token=')
  end

  test "create with multiple associated accounts includes link for admin" do
    sign_in create(:admin)
    @request.host = CDO.dashboard_hostname

    user1 = create :student, email: 'student1@email.com', parent_email: 'parent@email.com'
    user2 = create :student, email: 'student2@email.com', parent_email: 'parent@email.com'
    post :create, params: {user: {email: 'parent@email.com'}}

    assert_redirected_to '/users/password/new'

    assert_includes(flash[:notice], 'Reset password link sent to user. You may also send the link directly:')
    assert_includes(flash[:notice], "#{user1.username}: <a href='http://test-studio.code.org/users/password/edit?reset_password_token=")
    assert_includes(flash[:notice], "#{user2.username}: <a href='http://test-studio.code.org/users/password/edit?reset_password_token=")
  end

  test "create with valid email that doesn't exist says it doesn't work" do
    post :create, params: {user: {email: 'asdasda@asdasd.asda'}}

    assert_response :success

    assert_equal ['Email not found'], assigns(:user).errors.full_messages
  end

  test "create with blank email says it doesn't work" do
    post :create, params: {user: {email: ''}}
    assert_response :success

    assert_equal ['Email is required'], assigns(:user).errors.full_messages
  end
end
