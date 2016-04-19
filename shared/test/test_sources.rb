require_relative 'files_api_test_base' # Must be required first to establish load paths

class SourcesTest < FilesApiTestBase

  def setup
    @channel = create_channel
  end

  def teardown
    delete_channel(@channel)
    @channel = nil
  end

  def test_source_versions
    # Upload a source file.
    filename = 'test.js'
    file_data = 'abc 123'
    file_headers = { 'CONTENT_TYPE' => 'text/javascript' }
    delete_all_source_versions(filename)
    put_source(filename, file_data, file_headers)
    assert successful?

    # Overwrite it.
    new_file_data = 'def 456'
    put_source(filename, new_file_data, file_headers)
    assert successful?

    # Delete it.
    delete_source(filename)
    assert successful?

    # List versions.
    versions = list_source_versions(filename)
    assert successful?
    assert_equal 2, versions.count

    # Get the first and second version.
    first_version = get_source_version(filename, versions.last['versionId'])
    assert_equal file_data, first_version
    second_version = get_source_version(filename, versions.first['versionId'])
    assert_equal new_file_data, second_version

    # Check cache headers
    assert_equal 'private, must-revalidate, max-age=0', last_response['Cache-Control']
  end

  def test_replace_version
    # Upload a source file.
    filename = 'replace_me.js'
    file_data = 'version 1'
    file_headers = { 'CONTENT_TYPE' => 'text/javascript' }
    delete_all_source_versions(filename)
    put_source(filename, file_data, file_headers)
    assert successful?
    response = JSON.parse(last_response.body)

    # Overwrite it, specifying the same version.
    new_file_data = 'version 2'
    put_source_version(filename, response['versionId'], new_file_data, file_headers)
    assert successful?

    # List versions.
    versions = list_source_versions(filename)
    assert successful?
    assert_equal 1, versions.count
  end

  private

  def put_source(filename, body, headers)
    put_object 'sources', @channel, filename, body, headers
  end

  def delete_source(filename)
    delete_object 'sources', @channel, filename
  end

  def list_source_versions(filename)
    list_object_versions 'sources', @channel, filename
  end

  def get_source_version(filename, version_id)
    get_object_version 'sources', @channel, filename, version_id
  end

  def put_source_version(filename, version_id, body, headers)
    put_object_version 'sources', @channel, filename, version_id, body, headers
  end

  def delete_all_source_versions(filename)
    delete_all_versions(CDO.sources_s3_bucket, "sources_test/1/1/#{filename}")
  end
end
