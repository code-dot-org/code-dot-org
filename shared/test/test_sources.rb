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
    delete_all_versions('cdo-v3-sources', "sources_test/1/1/#{filename}")
    file_data = 'abc 123'
    put "/v3/sources/#{@channel}/#{filename}", file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert successful?

    # Overwrite it.
    new_file_data = 'def 456'
    put "/v3/sources/#{@channel}/#{filename}", new_file_data, 'CONTENT_TYPE' => 'text/javascript'
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
    delete_all_versions('cdo-v3-sources', "sources_test/1/1/#{filename}")
    file_data = 'version 1'
    put "/v3/sources/#{@channel}/#{filename}", file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert successful?
    response = JSON.parse(last_response.body)

    # Overwrite it, specifying the same version.
    new_file_data = 'version 2'
    put "/v3/sources/#{@channel}/#{filename}?version=#{response['versionId']}", new_file_data, 'CONTENT_TYPE' => 'text/javascript'
    assert successful?

    # List versions.
    versions = list_source_versions(filename)
    assert successful?
    assert_equal 1, versions.count
  end

  private

  def list_source_versions(filename)
    list_object_versions 'sources', @channel, filename
  end

  def get_source_version(filename, version_id)
    get_object_version 'sources', @channel, filename, version_id
  end

  def delete_source(filename)
    delete_object 'sources', @channel, filename
  end
end
