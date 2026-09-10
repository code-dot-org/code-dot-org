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
end
