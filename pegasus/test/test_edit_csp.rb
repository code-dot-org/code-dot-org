require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/mock_pegasus'

class EditCspTest < Minitest::Test

  def setup
    @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
  end

  def test_edit_csp
    dummy_channel_id = storage_encrypt_channel_id(1, 1)

    @pegasus.get "/edit-csp-app/#{dummy_channel_id}"
    assert @pegasus.last_response.unauthorized?, "Unauthenticated user can't view edit-csp-app."

    @pegasus.get "/edit-csp-table/#{dummy_channel_id}/mytable"
    assert @pegasus.last_response.unauthorized?, "Unauthenticated user can't view edit-csp-table."

    @pegasus.get "/edit-csp-properties/#{dummy_channel_id}"
    assert @pegasus.last_response.unauthorized?, "Unauthenticated user can't view edit-csp-properties."
  end
end
