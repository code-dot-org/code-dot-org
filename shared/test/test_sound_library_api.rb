require_relative 'test_helper'
require 'sound_library_api'
require 'pp'

class SoundLibraryTest < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  def build_rack_mock_session
    @session = Rack::MockSession.new(SoundLibraryApi, 'studio.code.org')
  end

  def test_get_sound
    stubs(:cache_for).returns(nil)
    get '/api/v1/sound-library/test_sound.mp3'
    pp last_response
    assert last_response.ok?
  end
end
