require 'test/unit'
require 'rack/test'
require_relative '../router'

ENV['RACK_ENV'] = 'test'

class EditCspTest < Test::Unit::TestCase
  include Rack::Test::Methods

  def app
    Documents
  end

  def test_edit_csp
    dummy_channel_id = storage_encrypt_channel_id(1, 1)

    get "/edit-csp-app/#{dummy_channel_id}"
    assert last_response.unauthorized?, "Unauthenticated user can't view edit-csp-app."

    get "/edit-csp-table/#{dummy_channel_id}/mytable"
    assert last_response.unauthorized?, "Unauthenticated user can't view edit-csp-table."

    get "/edit-csp-properties/#{dummy_channel_id}"
    assert last_response.unauthorized?, "Unauthenticated user can't view edit-csp-properties."
  end
end
