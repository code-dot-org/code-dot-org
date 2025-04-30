require 'test_helper'

class DcdoControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:admin)
  end

  test 'inaccessible by non-admins' do
    # Including both anonymous users
    get dcdo_path
    assert_response :redirect
    assert_redirected_to :new_user_session
    patch dcdo_path, params: {key: 'foo', data_type: 'String', value: 'bar'}
    assert_response :redirect
    assert_redirected_to :new_user_session

    # And signed-in users without elevated permissions
    sign_in(create(:user))
    get dcdo_path
    assert_response :forbidden
    patch dcdo_path, params: {key: 'foo', data_type: 'String', value: 'bar'}
    assert_response :forbidden
  end

  test 'accessible by admins' do
    sign_in(@admin)

    get dcdo_path
    assert_response :success

    patch dcdo_path, params: {key: 'foo', data_type: 'String', value: 'bar'}
    assert_response :redirect # this endpoint redirects on successful update
    assert_redirected_to action: 'show'
  end

  test 'can update dcdo values' do
    sign_in(@admin)
    refute_equal DCDO.get('foo', false), 'bar'
    patch dcdo_path, params: {key: 'foo', data_type: 'String', value: 'bar'}
    assert_response :redirect # this endpoint redirects on successful update
    assert_redirected_to action: 'show'
    assert_equal DCDO.get('foo', false), 'bar'
  end
end
