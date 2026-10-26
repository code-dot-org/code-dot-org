require 'test_helper'

class LegacyApiStackTest < ActiveSupport::TestCase
  let(:legacy_middleware) do
    legacy_middleware = Class.new(Sinatra::Base)
    legacy_middleware.set :environment, :development
    legacy_middleware
  end

  around do |test|
    Middleware::LegacyApiStack.stub_const(:APPS, [legacy_middleware]) {test.call}
  end

  it 'propagates downstream exceptions to Rails' do
    exception = ActiveRecord::RecordNotFound

    rails_app = ->(_env) {raise exception}
    stack = Middleware::LegacyApiStack.new(rails_app)

    _ {stack.call(Rack::MockRequest.env_for('/'))}.must_raise exception
  end

  describe 'origin protection' do
    # Echoes whatever the Rails session holds once the request gets through.
    let(:rails_app) {->(env) {[200, {}, [env['rack.session']['user'].to_s]]}}
    let(:stack) {Middleware::LegacyApiStack.new(rails_app)}

    def post_from(origin)
      env = Rack::MockRequest.env_for('/dashboardapi/v1/amazon_future_engineer_submit', method: 'POST', 'HTTP_ORIGIN' => origin)
      env['rack.session'] = {'user' => 'teacher'}
      stack.call(env)
    end

    it 'keeps the session for an unsafe request from the code.org marketing site' do
      _, _, body = post_from(CDO.code_org_url('', 'https:'))
      _(body.join).must_equal 'teacher'
    end

    it 'keeps the session for an unsafe request from a marketing-sites host' do
      _, _, body = post_from(CDO.marketing_sites_hosts.first)
      _(body.join).must_equal 'teacher'
    end

    it 'drops the session for an unsafe request from any other origin' do
      _, _, body = post_from('https://some-other-site.com')
      _(body.join).must_equal ''
    end
  end
end
