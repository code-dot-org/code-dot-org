require 'test_helper'

class Middleware::GlobalEditionTest < ActiveSupport::TestCase
  class FakeRequest
    attr_accessor :locale
    attr_reader :cookies

    def initialize
      @cookies = {}
    end

    def user
      nil
    end
  end

  test 'setup_region does not materialize a default rack session when logging metrics' do
    env = Rack::MockRequest.env_for('https://test-studio.code.org/users/sign_in')
    handler = Middleware::GlobalEdition::RouteHandler.new(->(_env) {[200, {}, ['ok']]}, env)
    handler.instance_variable_set(:@request, FakeRequest.new)

    captured_event = nil

    handler.define_singleton_method(:resolve_locale_for) { |_region| 'fa-IR' }
    handler.define_singleton_method(:set_global_cookie) { |_key, _value, high_priority: false| }
    handler.define_singleton_method(:set_locale_cookie) { |_value| }

    Cdo::GlobalEdition.stub(:region_available?, true) do
      Metrics::Events.stub(:log_event, ->(**event) {captured_event = event}) do
        handler.send(:setup_region, 'fa')
      end
    end

    assert_nil env[Rack::RACK_SESSION]
    assert_equal 'fa', handler.request.cookies[Cdo::GlobalEdition::REGION_KEY]
    assert_equal 'fa-IR', handler.request.cookies[Middleware::Helpers::Cookies::LOCALE_KEY]
    assert_equal 'fa-IR', handler.request.locale
    assert_equal 'Global Edition Region Changed', captured_event[:event_name]
    assert_nil captured_event[:session]
  end
end
