require 'test_helper'

class PasswordsControllerTest < ActionController::TestCase

  setup do
    @controller = Devise::PasswordsController.new
    @request.env["devise.mapping"] = Devise.mappings[:user]
  end

  test "new" do
    get :new
    assert_response :success
  end

   test "create with valid email says it works" do
     create :user, email: 'anemail@email.xx'
     post :create, user: {email: 'anemail@email.xx'}

     assert_redirected_to '/users/sign_in'

     assert_equal 'You will receive an email with instructions about how to reset your password in a few minutes.', flash[:notice]
   end

   test "create with valid email that doesn't exist says it doesn't work" do
     post :create, user: {email: 'asdasda@asdasd.asda'}

     assert_response :success

     assert_equal ['Email not found'], assigns(:user).errors.full_messages
  end

   test "create with blank email says it doesn't work" do
     post :create, user: {email: ''}
     assert_response :success

     assert_equal ['Email is required'], assigns(:user).errors.full_messages
  end


end
