require 'test_helper'

class DynamicConfigControllerTest < ActionController::TestCase
  test 'inaccessible by non-admins' do
    get :show
    assert_response :redirect
    get :gatekeeper_show
    assert_response :redirect

    user = create(:user)
    sign_in(user)
    get :show
    assert_response :forbidden
    get :gatekeeper_show
    assert_response :forbidden
  end

  test 'accessible by admins' do
    sign_in(create(:admin))
    get :show
    assert_response :success
    get :gatekeeper_show
    assert_response :success
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
    assert_includes @response.body, "# Gatekeeper Config\n ---\ntest gatekeeper:\n- rule:\n  where:\n    foo: bar\n  value: true"
    assert_includes @response.body, "# DCDO Config\n---\ntest dcdo: baz"
  end

  test 'can update gatekeeper values' do
    sign_in(create(:admin))
    refute Gatekeeper.allows('test update', where: {foo: 'bar'})
    post :gatekeeper_set, params: {feature: 'test update', where: {foo: 'bar'}.to_json, value: "true"}
    assert_response :redirect # this endpoint redirects on successful update
    assert Gatekeeper.allows('test update', where: {foo: 'bar'})
  end

  test 'can delete gatekeeper values' do
    sign_in(create(:admin))
    Gatekeeper.set('test delete', where: {foo: 'bar'}, value: true)
    assert Gatekeeper.allows('test delete', where: {foo: 'bar'})
    post :gatekeeper_delete, params: {feature: 'test delete', where: {foo: 'bar'}.to_json}
    assert_response :redirect # this endpoint redirects on successful deletion
    refute Gatekeeper.allows('test delete', where: {foo: 'bar'})
  end
end
