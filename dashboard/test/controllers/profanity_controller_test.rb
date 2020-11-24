require 'test_helper'

class ProfanityControllerTest < ActionController::TestCase
  setup do
    @user = create :user
  end

  teardown do
    # clear cache
  end

  test 'find: caches and returns profanities from ProfanityFilter' do
    text = 'lots of bad words'
    profanities = ['bad', 'words']
    ProfanityFilter.expects(:find_potential_profanities).once.returns(profanities)

    sign_in @user
    post :find, params: {text: text}
    assert_response :success
    assert_equal profanities, JSON.parse(@response.body)

    # Confirm ProfanityFilter response was cached but ProfanityFilter was not invoked a second time.
    post :find, params: {text: text}
    assert_response :success
    assert_equal profanities, JSON.parse(@response.body)
  end

  test 'find: redirects to login page if no authenticated user' do
    post :find
    assert_redirected_to '/users/sign_in'
  end

  test 'find: returns null if text is not provided' do
    ProfanityFilter.expects(:find_potential_profanities).never

    sign_in @user
    post :find
    assert_response :success
    assert_equal nil.to_json, @response.body
  end

  test 'find: uses locale param if provided' do
    ProfanityFilter.expects(:find_potential_profanities).with('hi', 'fake-locale')

    sign_in @user
    post :find, params: {text: 'hi', locale: 'fake-locale'}
    assert_response :success
  end
end
