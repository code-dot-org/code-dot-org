require_relative 'test_helper' # Must be required first to establish load paths
require 'mocha/mini_test'
require 'files_api'
require 'channels_api'

#
# Base class for tests against the FilesApi (which include SourcesTest,
# AssetsTest, AnimationsTest) which provides some useful common setup and
# utilities for testing that API.
#
# See also: FilesApiTestHelper, which is a simplified interface for making test
# requests against the API.  If you find yourself constructing a /v3/<endpoint>
# url in your function, it should probably go in that class, not here.
class FilesApiTestBase < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  # Special method used by Rack::Test to define what a test session looks like.
  # In turn, it automatically provides get, put, last_response, and other methods.
  def build_rack_mock_session
    @session = Rack::MockSession.new(ChannelsApi.new(FilesApi), 'studio.code.org')
  end

  # Create a new channel
  # @return [String] the new encrypted channel ID
  def create_channel
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    last_response.location.split('/').last
  end

  # Delete the given channel, asserting that deletion is successful
  # @param [String] channel_id - the encrypted channel ID
  def delete_channel(channel_id)
    delete "/v3/channels/#{channel_id}"
    assert last_response.successful?
  end

  # Delete all objects in the specified path from S3.
  def delete_all_objects(bucket, prefix)
    raise "Not a test path: #{prefix}" unless prefix.include?('test')
    s3 = Aws::S3::Client.new
    objects = s3.list_objects(bucket: bucket, prefix: prefix).contents.map do |object|
      { key: object.key }
    end
    s3.delete_objects(
        bucket: bucket,
        delete: {
            objects: objects,
            quiet: true
        }
    ) if objects.any?
  end

  # Delete all versions of the specified file from S3, including all delete markers
  def delete_all_versions(bucket, key)
    s3 = Aws::S3::Client.new
    response = s3.list_object_versions(bucket: bucket, prefix: key)
    objects = response.versions.concat(response.delete_markers).map do |version|
      {
          key: key,
          version_id: version.version_id
      }
    end
    s3.delete_objects(
        bucket: bucket,
        delete: {
            objects: objects,
            quiet: true
        }
    ) if objects.any?
  end

  def assert_fileinfo_equal(expected, actual)
    assert_equal(Hash, actual.class)
    assert_equal(expected['filename'], actual['filename'])
    assert_equal(expected['category'], actual['category'])
    assert_equal(expected['size'], actual['size'])
  end

  def successful?
    last_response.successful?
  end

  def not_found?
    last_response.not_found?
  end

  def unsupported_media_type?
    last_response.status == 415
  end

end
