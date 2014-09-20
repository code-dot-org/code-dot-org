require 'test_helper'

class ZendeskSessionControllerTest < ActionController::TestCase
  include Devise::TestHelpers
  setup do
    @user = create(:student)
  end

  test "redirects to zendesk when signed in" do
    sign_in @user
    get :index
    assert_response :redirect
    assert @response.redirect_url.start_with? "https://codeorg.zendesk.com/access/jwt"
  end

  test "redirects to zendesk when signed in without age" do
    # avoid the problem where we ask you for your age and then tell you you can't sign in to zendesk
    # (because the error page was rendered under the age dialog)
    user = create(:student)
    user.update_attribute(:birthday, nil)

    sign_in user
    get :index
    assert_response :redirect
    assert @response.redirect_url.start_with? "https://codeorg.zendesk.com/access/jwt"
  end

  test "does not sign in to zendesk when < 13" do
    user = create :user, age: 10
    sign_in user

    get :index
    assert_response :success # good old 200 success on failure..
  end

  test "redirects to sign in when not signed in" do
    get :index
    assert_response :redirect
    assert_redirected_to "/users/sign_in"
  end

  
end
