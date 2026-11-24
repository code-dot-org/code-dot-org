require 'test_helper'

class LastWriteStampTest < ActiveSupport::TestCase
  test 'stamps the session after a signed-in write request' do
    assert session_after('POST', 'api/v1/users#post_mute_music')[:last_write]
  end

  test 'does not stamp the session after a read request' do
    assert_nil session_after('GET', 'api/v1/users#get_mute_music')[:last_write]
  end

  test 'does not stamp the session after a milestone' do
    assert_nil session_after('POST', 'activities#milestone')[:last_write]
  end

  test 'does not stamp the session after a signed-out write request' do
    assert_nil session_after('POST', 'api/v1/users#post_mute_music', user: nil)[:last_write]
  end

  # Returns the session after one request through the middleware, routed to controller#action.
  private def session_after(method, route, user: build(:student))
    controller, action = route.split('#')
    env = Rack::MockRequest.env_for('/', method: method)
    env['rack.session'] = {}
    env['warden'] = stub(user: user)
    app = lambda do |routed_env|
      routed_env['action_dispatch.request.path_parameters'] = {controller: controller, action: action}
      [200, {}, []]
    end

    Middleware::LastWriteStamp.new(app).call(env)
    env['rack.session']
  end
end
