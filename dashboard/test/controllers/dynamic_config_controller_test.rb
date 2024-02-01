require 'test_helper'

class DynamicConfigControllerTest < ActionController::TestCase
  GET_ROUTES = %i[show gatekeeper_show].freeze
  POST_ROUTES = %i[gatekeeper_set gatekeeper_delete].freeze
  ALL_ROUTES = (GET_ROUTES + POST_ROUTES).freeze

  # The routes currently defined by this controller are pretty consistently
  # structured, so it's possible to define a basic helper that naively executes
  # a "default" HTTP interaction for a given route.
  #
  # This can be used in individual tests to easily verify functionality for
  # every single route as a bulk operation.
  def perform_default_http_interaction_for_route(route)
    case route.to_sym
    when *GET_ROUTES
      get route
    when *POST_ROUTES
      post route, params: {feature: 'test access', where: '{}', value: 'true'}
    else
      raise "Don't know what the default HTTP interaction is for #{route.inspect}"
    end
  end

  test 'inaccessible by non-admins' do
    # Including both anonymous users
    ALL_ROUTES.each do |route|
      perform_default_http_interaction_for_route(route)
      assert_response :redirect
      assert_redirected_to :new_user_session
    end

    # And signed-in users without elevated permissions
    sign_in(create(:user))
    ALL_ROUTES.each do |route|
      perform_default_http_interaction_for_route(route)
      assert_response :forbidden
    end
  end

  test 'accessible by admins' do
    sign_in(create(:admin))

    GET_ROUTES.each do |route|
      perform_default_http_interaction_for_route(route)
      assert_response :success
    end

    POST_ROUTES.each do |route|
      perform_default_http_interaction_for_route(route)
      assert_response :redirect
      assert_redirected_to action: 'gatekeeper_show', params: {feature: 'test access'}
    end
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
