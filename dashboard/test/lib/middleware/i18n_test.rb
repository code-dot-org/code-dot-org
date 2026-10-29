require 'test_helper'

class I18nMiddlewareTest < ActiveSupport::TestCase
  subject(:middleware) {Middleware::I18n.new(app)}

  let(:app) {->(_env) {[200, {}, ['downstream']]}}

  def env_for(path_info, query_string)
    Rack::MockRequest.env_for("http://#{CDO.dashboard_hostname}/").merge(
      'PATH_INFO' => path_info, 'QUERY_STRING' => query_string,
    )
  end

  it 'passes malformed query string downstream' do
    status, _, body = middleware.call(env_for('/users/sign_in', 'x=%'))

    _(status).must_equal 200
    _(body.join).must_equal 'downstream'
  end

  it 'redirects set_locale request for protocol-relative path to same site' do
    status, headers, = middleware.call(env_for('//evil.com', 'set_locale=es-MX'))

    _(status).must_equal 302
    _(headers['Location']).must_equal '/evil.com'
  end

  it 'redirects set_locale request with unparsable path' do
    status, headers, = middleware.call(env_for('/users/sign_in|x', 'set_locale=es-MX&foo=bar'))

    _(status).must_equal 302
    _(headers['Location']).must_equal '/users/sign_in|x?foo=bar'
  end
end
