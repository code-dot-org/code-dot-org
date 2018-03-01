require_relative 'test_helper'
require 'sound_library_api'
require_relative 'files_api_test_base'

class SoundLibraryTest < FilesApiTestBase
  SOUND_LIBRARY_TEST_KEY = 'test_sound.mp3'.freeze

  def build_rack_mock_session
    @session = Rack::MockSession.new(SoundLibraryApi, 'studio.code.org')
  end

  def test_get_sound
    content = 'MP3_CONTENT'
    # Ensure the shared S3 client is used by stubbing the client with the expected response.
    AWS::S3.s3 = Aws::S3::Client.new(
      stub_responses: {
        list_object_versions: {
          versions: [{key: '', version_id: 'version'}]
        },
        head_object: {delete_marker: false},
        get_object: {body: content}
      }
    )
    get '/api/v1/sound-library/test_sound.mp3'
    assert last_response.ok?
    assert_equal content, last_response.body
  ensure
    AWS::S3.s3 = nil
  end

  def test_get_deleted_sound
    assert_empty SOUND_LIBRARY_BUCKET, SOUND_LIBRARY_TEST_KEY
    content = 'MP3_CONTENT'

    s3 = AWS::S3.create_client
    s3.put_object(
      bucket: SOUND_LIBRARY_BUCKET,
      key: SOUND_LIBRARY_TEST_KEY,
      body: content,
      content_type: 'audio/mp3'
    )
    s3.delete_object(
      bucket: SOUND_LIBRARY_BUCKET,
      key: SOUND_LIBRARY_TEST_KEY,
    )

    get "/api/v1/sound-library/#{SOUND_LIBRARY_TEST_KEY}"
    assert last_response.ok?
    assert_equal content, last_response.body
  ensure
    delete_all_versions(SOUND_LIBRARY_BUCKET, SOUND_LIBRARY_TEST_KEY, 10)
  end

  # Ensure no versions of the specified object currently exist.
  def assert_empty(bucket, key)
    response = AWS::S3.create_client.
      list_object_versions(bucket: bucket, prefix: key)
    versions = response.versions.concat(response.delete_markers)
    assert versions.empty?, "s3://#{bucket}/#{key} is not empty."
  end
end
