require 'test_helper'

class ProfanityControllerTest < ActionController::TestCase
  test 'find: redirects to login page if no authenticated user' do
    post :find
    assert_redirected_to '/users/sign_in'
  end

  test 'find: uses locale param if provided' do
    ProfanityFilter.expects(:find_potential_profanities).with('hi', 'fake-locale')

    sign_in create(:user)
    post :find, params: {text: 'hi', locale: 'fake-locale'}
    assert_response :success
  end
end
