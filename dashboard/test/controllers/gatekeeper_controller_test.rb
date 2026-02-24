require 'test_helper'

class GatekeeperControllerTest < ActionDispatch::IntegrationTest
  ACTIONS = [:show, :update, :destroy]

  # The routes currently defined by this controller are pretty consistently
  # structured, so it's possible to define a basic helper that naively executes
  # a "default" HTTP interaction for a given action.
  #
  # This can be used in individual tests to easily verify functionality for
  # every single route as a bulk operation.
  def request_default(action)
    case action.to_sym
    when :show
      get gatekeeper_path
    when :update
      patch gatekeeper_path, params: {feature: 'test access', where: {foo: 'bar'}.to_json, value: 'true'}
    when :destroy
      delete gatekeeper_path, params: {feature: 'test access', where: {foo: 'bar'}.to_json}
    else
      raise "Don't know what the default HTTP interaction is for #{action.inspect}"
    end
  end

  setup do
    @admin = create(:admin)
  end

  test 'inaccessible by non-admins' do
    # Including both anonymous users
    ACTIONS.each do |action|
      request_default(action)
      assert_response(:redirect)
      assert_redirected_to(:new_user_session)
    end

    # And signed-in users without elevated permissions
    sign_in(create(:user))
    ACTIONS.each do |action|
      request_default(action)
      assert_response(:forbidden)
    end
  end

  test 'accessible by admins' do
    sign_in(@admin)

    request_default(:show)
    assert_response(:success)

    [:update, :destroy].each do |action|
      request_default(action)
      assert_response :redirect
      assert_redirected_to action: 'show', params: {feature: 'test access'}
    end
  end

  test 'can update gatekeeper values' do
    sign_in(@admin)
    refute Gatekeeper.allows('test access', where: {foo: 'bar'})
    request_default(:update)
    assert_response :redirect # this endpoint redirects on successful update
    assert_redirected_to action: 'show', params: {feature: 'test access'}
    assert Gatekeeper.allows('test access', where: {foo: 'bar'})
  end

  test 'can delete gatekeeper values' do
    sign_in(@admin)
    Gatekeeper.set('test access', where: {foo: 'bar'}, value: true)
    assert Gatekeeper.allows('test access', where: {foo: 'bar'})
    request_default(:destroy)
    assert_response :redirect # this endpoint redirects on successful deletion
    assert_redirected_to action: 'show', params: {feature: 'test access'}
    refute Gatekeeper.allows('test access', where: {foo: 'bar'})
  end
end
