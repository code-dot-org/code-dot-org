require 'test_helper'

class DynamicConfigControllerTest < ActionController::TestCase
  test 'inaccessible by non-admins' do
    get :show
    assert_response :redirect
    assert_redirected_to :new_user_session
    get :gatekeeper_show
    assert_response :redirect
    assert_redirected_to :new_user_session
    post :gatekeeper_set, params: {feature: 'test access', where: '{}', value: 'true'}
    assert_response :redirect
    assert_redirected_to :new_user_session
    post :gatekeeper_delete, params: {feature: 'test access', where: '{}'}
    assert_response :redirect
    assert_redirected_to :new_user_session

    sign_in(create(:user))
    get :show
    assert_response :forbidden
    get :gatekeeper_show
    assert_response :forbidden
    post :gatekeeper_set, params: {feature: 'test access', where: '{}', value: 'true'}
    assert_response :forbidden
    post :gatekeeper_delete, params: {feature: 'test access', where: '{}'}
    assert_response :forbidden
  end

  test 'accessible by admins' do
    sign_in(create(:admin))
    get :show
    assert_response :success
    get :gatekeeper_show
    assert_response :success
    post :gatekeeper_set, params: {feature: 'test access', where: '{}', value: 'true'}
    assert_response :redirect
    assert_redirected_to action: 'gatekeeper_show', params: {feature: 'test access'}
    post :gatekeeper_delete, params: {feature: 'test access', where: '{}', value: 'true'}
    assert_response :redirect
    assert_redirected_to action: 'gatekeeper_show', params: {feature: 'test access'}
  end

  test 'can render dynamic config values' do
    sign_in(create(:admin))
    get :show
    assert_response :success
    assert_includes @response.body, "# Gatekeeper Config\n --- {}"
    assert_includes @response.body, "# DCDO Config\n--- {}"

    Gatekeeper.set('test gatekeeper', where: {foo: 'bar'}, value: true)
    DCDO.set('test dcdo', 'baz')
    get :show
    assert_response :success
    assert_includes @response.body, "# Gatekeeper Config\n ---\ntest gatekeeper:"
    assert_includes @response.body, "# DCDO Config\n---\ntest dcdo: baz"
  end

  test 'can update gatekeeper values' do
    sign_in(create(:admin))
    refute Gatekeeper.allows('test update', where: {foo: 'bar'})
    post :gatekeeper_set, params: {feature: 'test update', where: {foo: 'bar'}.to_json, value: 'true'}
    assert_response :redirect # this endpoint redirects on successful update
    assert_redirected_to action: 'gatekeeper_show', params: {feature: 'test update'}
    assert Gatekeeper.allows('test update', where: {foo: 'bar'})
  end

  test 'can delete gatekeeper values' do
    sign_in(create(:admin))
    Gatekeeper.set('test delete', where: {foo: 'bar'}, value: true)
    assert Gatekeeper.allows('test delete', where: {foo: 'bar'})
    post :gatekeeper_delete, params: {feature: 'test delete', where: {foo: 'bar'}.to_json}
    assert_response :redirect # this endpoint redirects on successful deletion
    assert_redirected_to action: 'gatekeeper_show', params: {feature: 'test delete'}
    refute Gatekeeper.allows('test delete', where: {foo: 'bar'})
  end
end
