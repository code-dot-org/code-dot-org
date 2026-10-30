require_relative '../../test_helper'

# Minimal stub — the real Geocoder is not loaded outside Rails.
module Geocoder
  def self.search(_query)
    []
  end
end

require 'cdo/rack/geolocation_override'

ORIGINAL_IP = '192.0.2.1'

describe Rack::GeolocationOverride do
  let(:cookie_key) {Rack::GeolocationOverride::KEY}
  let(:app_env) {Rack::MockRequest.env_for('/', 'REMOTE_ADDR' => ORIGINAL_IP)}
  let(:app) {->(_env) {[200, {}, ['ok']]}}
  let(:middleware) {Rack::GeolocationOverride.new(app)}

  def call_with_cookie(value)
    app_env['HTTP_COOKIE'] = "#{cookie_key}=#{value}"
    middleware.call(app_env)
    app_env
  end

  describe '#call' do
    describe 'with a 2-letter uppercase country code' do
      it 'sets HTTP_CLOUDFRONT_VIEWER_COUNTRY directly' do
        env = call_with_cookie('ES')
        _(env['HTTP_CLOUDFRONT_VIEWER_COUNTRY']).must_equal 'ES'
      end

      it 'preserves REMOTE_ADDR' do
        env = call_with_cookie('ES')
        _(env['REMOTE_ADDR']).must_equal ORIGINAL_IP
      end

      it 'does not call Geocoder' do
        Geocoder.stubs(:search).raises('Geocoder should not be called')
        call_with_cookie('DE')
      ensure
        Geocoder.unstub(:search)
      end
    end

    describe 'with a lowercase string' do
      it 'falls through to the IP-based path' do
        Geocoder.stubs(:search).returns([])
        env = call_with_cookie('es')
        _(env['REMOTE_ADDR']).must_equal 'es'
      ensure
        Geocoder.unstub(:search)
      end
    end

    describe 'with an IP address' do
      it 'falls through to the IP-based path' do
        Geocoder.stubs(:search).returns([])
        env = call_with_cookie('150.214.39.255')
        _(env['REMOTE_ADDR']).must_equal '150.214.39.255'
      ensure
        Geocoder.unstub(:search)
      end
    end

    describe 'without a cookie' do
      it 'passes through without modifying REMOTE_ADDR' do
        Geocoder.stubs(:search).returns([])
        middleware.call(app_env)
        _(app_env['REMOTE_ADDR']).must_equal ORIGINAL_IP
      ensure
        Geocoder.unstub(:search)
      end
    end
  end
end
