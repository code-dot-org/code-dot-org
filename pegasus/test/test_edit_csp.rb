require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/mock_pegasus'
# needed by /v3/edit-csp-app/splat.haml
require_relative '../../shared/middleware/helpers/table'
require 'channels_api'

class EditCspTest < Minitest::Test

  def setup
    @owned_channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))

    # @pegasus shares the storage_id cookie with @owned_channels.
    @owned_channels.get '/v3/channels'
    cookies = @owned_channels.last_response.headers['Set-Cookie']
    pegasus_mock_session = Rack::MockSession.new(MockPegasus.new, "studio.code.org")
    pegasus_mock_session.cookie_jar.merge(cookies)
    @pegasus = Rack::Test::Session.new(pegasus_mock_session)

    # @pegasus does not share cookies with @unowned_channels.
    @unowned_channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
  end

  def test_edit_csp
    # Create a channel which our mock pegasus client appears to own.
    @owned_channels.post "/v3/channels", {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    owned_channel_id = @owned_channels.last_response.location.split('/').last

    @pegasus.get "/v3/edit-csp-app/#{owned_channel_id}"
    assert @pegasus.last_response.successful?, "Authenticated user can view edit-csp-app."

    @pegasus.get "/v3/edit-csp-table/#{owned_channel_id}/mytable"
    assert @pegasus.last_response.successful?, "Authenticated user can view edit-csp-table."

    @pegasus.get "/v3/edit-csp-properties/#{owned_channel_id}"
    assert @pegasus.last_response.successful?, "Authenticated user can view edit-csp-properties."

    # Create a channel which our mock pegasus client does not own.
    @unowned_channels.post "/v3/channels", {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    unowned_channel_id = @unowned_channels.last_response.location.split('/').last

    @pegasus.get "/v3/edit-csp-app/#{unowned_channel_id}"
    assert @pegasus.last_response.unauthorized?, "Unauthenticated user can't view edit-csp-app."

    @pegasus.get "/v3/edit-csp-table/#{unowned_channel_id}/mytable"
    assert @pegasus.last_response.unauthorized?, "Unauthenticated user can't view edit-csp-table."

    @pegasus.get "/v3/edit-csp-properties/#{unowned_channel_id}"
    assert @pegasus.last_response.unauthorized?, "Unauthenticated user can't view edit-csp-properties."
  end
end
