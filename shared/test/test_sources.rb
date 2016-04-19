require_relative 'files_api_test_base'

class SourcesTest < FilesApiTestBase

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
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel = last_response.location.split('/').last

    # Upload a source file.
    filename = 'test.js'
    delete_all_versions('cdo-v3-sources', "sources_test/1/1/#{filename}")
    file_data = 'abc 123'
    put "/v3/sources/#{channel}/#{filename}", file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert last_response.successful?

    # Overwrite it.
    new_file_data = 'def 456'
    put "/v3/sources/#{channel}/#{filename}", new_file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert last_response.successful?

    # Delete it.
    delete "/v3/sources/#{channel}/#{filename}"
    assert last_response.successful?

    # List versions.
    get "/v3/sources/#{channel}/#{filename}/versions"
    assert last_response.successful?
    versions = JSON.parse(last_response.body)
    assert_equal 2, versions.count

    # Get the first and second version.
    get "/v3/sources/#{channel}/#{filename}?version=#{versions.last['versionId']}"
    assert_equal file_data, last_response.body
    get "/v3/sources/#{channel}/#{filename}?version=#{versions.first['versionId']}"
    assert_equal new_file_data, last_response.body

    # Check cache headers
    assert_equal 'private, must-revalidate, max-age=0', last_response['Cache-Control']
  end

  def test_replace_version
    post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channel = last_response.location.split('/').last

    # Upload a source file.
    filename = 'replace_me.js'
    delete_all_versions('cdo-v3-sources', "sources_test/1/1/#{filename}")
    file_data = 'version 1'
    put "/v3/sources/#{channel}/#{filename}", file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert last_response.successful?
    response = JSON.parse(last_response.body)

    # Overwrite it, specifying the same version.
    new_file_data = 'version 2'
    put "/v3/sources/#{channel}/#{filename}?version=#{response['versionId']}", new_file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert last_response.successful?

    # List versions.
    get "/v3/sources/#{channel}/#{filename}/versions"
    assert last_response.successful?
    versions = JSON.parse(last_response.body)
    assert_equal 1, versions.count
  end
end
