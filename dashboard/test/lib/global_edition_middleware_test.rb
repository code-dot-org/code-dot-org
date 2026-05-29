# frozen_string_literal: true

require 'test_helper'

class GlobalEditionMiddlewareTest < ActiveSupport::TestCase
  def test_region_change_redirect_does_not_call_downstream_app
    downstream_call_count = 0
    app = lambda do |_env|
      downstream_call_count += 1
      [200, {'Content-Type' => 'text/plain'}, ['ok']]
    end

    middleware = Middleware::GlobalEdition.new(app)

    Cdo::GlobalEdition.stubs(:target_host?).with('test-studio.code.org').returns(true)
    Metrics::Events.stubs(:log_event)

    env = Rack::MockRequest.env_for('http://test-studio.code.org/users/sign_in?ge_region=fa')
    status, headers, = middleware.call(env)

    assert_equal 302, status
    assert_equal '/fa/users/sign_in', headers['Location']
    assert_equal 0, downstream_call_count
  end

  def test_effective_region_is_memoized_for_original_region_branch
    app = lambda do |_env|
      [200, {'Content-Type' => 'text/plain'}, ['ok']]
    end
    request_globalizer_class = Middleware::GlobalEdition.const_get(:RequestGlobalizer)
    env = Rack::MockRequest.env_for('http://test-studio.code.org/users/sign_in', 'HTTP_COOKIE' => 'ge_region=fa')
    globalizer = request_globalizer_class.new(app, env)

    Cdo::GlobalEdition.stubs(:locales_regions).returns({'en-US' => ['fa']})
    Cdo::GlobalEdition.expects(:region_available?).with('fa').once.returns(true)

    assert_equal 'fa', globalizer.send(:effective_region)
    assert_equal 'fa', globalizer.send(:effective_region)
  end
end
