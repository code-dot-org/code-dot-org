require 'test_helper'

class DcdoControllerTest < ActionDispatch::IntegrationTest
  test 'inaccessible by non-admins' do
    # Including both anonymous users
    get :show
    assert_response :redirect
    assert_redirected_to :new_user_session
    patch :update, params: {key: 'foo', data_type: 'String', value: 'bar'}
    assert_response :redirect
    assert_redirected_to :new_user_session

    # And signed-in users without elevated permissions
    sign_in(create(:user))
    get :show
    assert_response :forbidden
    patch :update, params: {key: 'foo', data_type: 'String', value: 'bar'}
    assert_response :forbidden
  end

  test 'accessible by admins' do
    sign_in(create(:admin))

    get :show
    assert_response :success
    patch :update, params: {key: 'foo', data_type: 'String', value: 'bar'}
    assert_response :redirect # this endpoint redirects on successful update
    assert_redirected_to action: 'show', params: {feature: 'test access'}
  end

  test 'can update dcdo values' do
    sign_in(create(:admin))
    refute_equals DCDO.get('foo'), 'bar'
    patch :update, params: {key: 'foo', data_type: 'String', value: 'bar'}
    assert_response :redirect # this endpoint redirects on successful update
    assert_redirected_to action: 'show', params: {feature: 'test access'}
    assert_equals DCDO.get('foo'), 'bar'
  end
end
