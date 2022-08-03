require_relative './test_helper'
require 'mocha/mini_test'
require_relative 'fixtures/mock_pegasus'
require 'helpers/core'

CAUSES_ARGUMENTERROR = "bT0zAyBvk".freeze
CAUSES_CIPHERERROR = "IMALITTLETEAPOTSHORTANDSTOUT".freeze

class Base64ErrorTest < Minitest::Test
  include SetupTest

  def setup
    @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
  end

  def test_base64_error
    # test all the cases with a channel ID that will raise ArgumentError internally when trying to base64 decode
    run_test_cases CAUSES_ARGUMENTERROR
    # test all the cases with a channel ID that will raise OpenSSL::Cipher::CipherError internally when trying to base64 decode
    run_test_cases CAUSES_CIPHERERROR

    # For this route, just test with one case - route doesn't support input being long enough to hit the other case
    @pegasus.get "/api/hour/certificate64/anycourse/#{CAUSES_ARGUMENTERROR}"
    assert_equal 400, @pegasus.last_response.status
  end

  private

  def run_test_cases(channel_id)
    @pegasus.get "/v2/hoc/certificate/#{channel_id}"
    assert_equal 400, @pegasus.last_response.status
  end
end
