require_relative 'test_helper'
require 'files_api'
require 'channels_api'

class SourcesTest < Minitest::Test
  include SetupTest

  def setup
    init_apis
  end

  # Delete all versions of the specified file from S3.
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

  def test_source_versions
    @channels.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel = @channels.last_response.location.split('/').last

    # Upload a source file.
    filename = 'test.js'
    delete_all_versions('cdo-v3-sources', "sources_test/1/1/#{filename}")
    file_data = 'abc 123'
    @files.put "/v3/sources/#{channel}/#{filename}", file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert @files.last_response.successful?

    # Overwrite it.
    new_file_data = 'def 456'
    @files.put "/v3/sources/#{channel}/#{filename}", new_file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert @files.last_response.successful?

    # Delete it.
    @files.delete "/v3/sources/#{channel}/#{filename}"
    assert @files.last_response.successful?

    # List versions.
    @files.get "/v3/sources/#{channel}/#{filename}/versions"
    assert @files.last_response.successful?
    versions = JSON.parse(@files.last_response.body)
    assert_equal 2, versions.count

    # Get the first and second version.
    @files.get "/v3/sources/#{channel}/#{filename}?version=#{versions.last['versionId']}"
    assert_equal file_data, @files.last_response.body
    @files.get "/v3/sources/#{channel}/#{filename}?version=#{versions.first['versionId']}"
    assert_equal new_file_data, @files.last_response.body

    # Check cache headers
    assert_equal 'private, must-revalidate, max-age=0', @files.last_response['Cache-Control']
  end

  def test_replace_version
    @channels.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel = @channels.last_response.location.split('/').last

    # Upload a source file.
    filename = 'replace_me.js'
    delete_all_versions('cdo-v3-sources', "sources_test/1/1/#{filename}")
    file_data = 'version 1'
    @files.put "/v3/sources/#{channel}/#{filename}", file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert @files.last_response.successful?
    response = JSON.parse(@files.last_response.body)

    # Overwrite it, specifying the same version.
    new_file_data = 'version 2'
    @files.put "/v3/sources/#{channel}/#{filename}?version=#{response['versionId']}", new_file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert @files.last_response.successful?

    # List versions.
    @files.get "/v3/sources/#{channel}/#{filename}/versions"
    assert @files.last_response.successful?
    versions = JSON.parse(@files.last_response.body)
    assert_equal 1, versions.count
  end

  # Methods below this line are test utilities, not actual tests
  private

  def init_apis
    @channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, 'studio.code.org'))

    # Make sure the sources api has the same storage id cookie used by the channels api.
    @channels.get '/v3/channels'
    cookies = @channels.last_response.headers['Set-Cookie']
    sources_mock_session = Rack::MockSession.new(FilesApi, "studio.code.org")
    sources_mock_session.cookie_jar.merge(cookies)
    @files = Rack::Test::Session.new(sources_mock_session)
  end
end
