require 'test_helper'

class GlobalEditionMiddlewareTest < ActiveSupport::TestCase
  subject(:middleware) {Middleware::GlobalEdition.new(app)}

  # Echoes the path the downstream app was given.
  let(:app) {->(env) {[200, {}, [env['PATH_INFO']]]}}

  def env_for(path_info, query_string = '')
    Rack::MockRequest.env_for("http://#{CDO.dashboard_hostname}/").merge(
      'PATH_INFO' => path_info, 'QUERY_STRING' => query_string,
    )
  end

  it 'passes malformed query string downstream' do
    status, _, body = middleware.call(env_for('/users/sign_in', 'x=%'))

    _(status).must_equal 200
    _(body.join).must_equal '/users/sign_in'
  end

  it 'keeps array and nested params in ge_region redirect' do
    status, headers, = middleware.call(env_for('/users/sign_in', 'ge_region=la&ids[]=1&ids[]=2&user[name]=x'))
    path, query = headers['Location'].split('?', 2)

    _(status).must_equal 302
    _(path).must_equal '/la/users/sign_in'
    _(Rack::Utils.parse_nested_query(query)).must_equal('ids' => %w[1 2], 'user' => {'name' => 'x'})
  end

  it 'redirects ge_region request for protocol-relative path to same site' do
    status, headers, = middleware.call(env_for('//evil.com', 'ge_region=us'))

    _(status).must_equal 302
    _(headers['Location']).must_equal '/evil.com'
  end

  it 'redirects ge_region request with unparsable path' do
    status, headers, = middleware.call(env_for('/users/sign_in|x', 'ge_region=la&foo=bar'))

    _(status).must_equal 302
    _(headers['Location']).must_equal '/la/users/sign_in|x?foo=bar'
  end
end
