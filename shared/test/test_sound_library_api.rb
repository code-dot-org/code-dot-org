require_relative 'test_helper'
require 'sound_library_api'

class SoundLibraryTest < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  def build_rack_mock_session
    @session = Rack::MockSession.new(SoundLibraryApi, 'studio.code.org')
  end

  # VCR file for this test was made before the mp3 was deleted.
  # To regenerate the VCR file, upload test_sound.mp3
  # to S3 cdo-sound-library and run this test.
  def test_get_sound
    stubs(:cache_for).returns(nil)
    get '/api/v1/sound-library/test_sound.mp3'
    assert last_response.ok?
  end

  # VCR file for this test was made after the mp3 was deleted.
  # To regenerate the VCR file, delete the uploaded test_sound.mp3
  # from S3 cdo-sound-library and run this test. Since the bucket is
  # versioned, and the api gets the most recent non-deleted version
  # the response should still be valid.
  def test_get_deleted_sound
    stubs(:cache_for).returns(nil)
    get '/api/v1/sound-library/test_sound.mp3'
    assert last_response.ok?
  end
end
