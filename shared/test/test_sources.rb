require_relative 'files_api_test_base' # Must be required first to establish load paths
require_relative 'files_api_test_helper'

class SourcesTest < FilesApiTestBase

  def setup
    @channel = create_channel
    @api = FilesApiTestHelper.new(current_session, 'sources', @channel)
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
    @api.put_object(filename, file_data, file_headers)
    assert successful?

    # Overwrite it.
    new_file_data = 'def 456'
    @api.put_object(filename, new_file_data, file_headers)
    assert successful?

    # Delete it.
    @api.delete_object(filename)
    assert successful?

    # List versions.
    versions = @api.list_object_versions(filename)
    assert successful?
    assert_equal 2, versions.count

    # Get the first and second version.
    first_version = @api.get_object_version(filename, versions.last['versionId'])
    assert_equal file_data, first_version
    second_version = @api.get_object_version(filename, versions.first['versionId'])
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
    @api.put_object(filename, file_data, file_headers)
    assert successful?
    response = JSON.parse(last_response.body)

    # Overwrite it, specifying the same version.
    new_file_data = 'version 2'
    @api.put_object_version(filename, response['versionId'], new_file_data, file_headers)
    assert successful?

    # List versions.
    versions = @api.list_object_versions(filename)
    assert successful?
    assert_equal 1, versions.count
  end

  private

  def delete_all_source_versions(filename)
    delete_all_versions(CDO.sources_s3_bucket, "sources_test/1/1/#{filename}")
  end
end
