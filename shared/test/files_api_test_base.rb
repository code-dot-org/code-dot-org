require 'mocha/mini_test'
require 'files_api'
require 'channels_api'
require_relative 'test_helper'

class FilesApiTestBase < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  def build_rack_mock_session
    @session = Rack::MockSession.new(ChannelsApi.new(FilesApi), 'studio.code.org')
  end
end