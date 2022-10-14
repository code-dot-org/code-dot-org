require_relative './test_helper'
require 'mocha/mini_test'
require_relative 'fixtures/mock_pegasus'

CAUSES_ARGUMENTERROR = "bT0zAyBvk".freeze
CAUSES_CIPHERERROR = "IMALITTLETEAPOTSHORTANDSTOUT".freeze

class HocBase64ErrorTest < Minitest::Test
  include SetupTest

  def setup
    @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
  end

  def test_base64_error
    # For this route, just test with one case - route doesn't support input being long enough to hit the other case
    @pegasus.get "/api/hour/certificate64/anycourse/#{CAUSES_ARGUMENTERROR}"
    assert_equal 400, @pegasus.last_response.status
  end
end
