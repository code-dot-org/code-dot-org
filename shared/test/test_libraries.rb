require_relative 'files_api_test_base' # Must be required first to establish load paths
require_relative 'files_api_test_helper'

class LibrariesTest < FilesApiTestBase
  def setup
    NewRelic::Agent.reset_stub
    @channel_id = create_channel
    @api = FilesApiTestHelper.new(current_session, 'libraries', @channel_id)
    @api.ensure_aws_credentials
    ShareFiltering.stubs(:find_failure).returns(nil)
  end

  def teardown
    # Require that tests delete the assets they upload
    get "v3/libraries/#{@channel_id}"
    assert_empty JSON.parse(last_response.body)
    delete_channel(@channel_id)
    @channel_id = nil
  end

  def test_upload_libraries
    library_filename = 'library.json'
    library_body = '{"library":"library"}'

    # Make sure we have a clean starting point
    delete_all_library_versions(library_filename)

    # Upload library.json and check the response
    response = @api.put_object(library_filename, library_body, {'CONTENT_TYPE' => 'application/json'})
    actual_library_info = JSON.parse(response)
    expected_library_info = {
      'filename' => library_filename,
      'category' => 'application',
      'size' => library_body.length
    }
    assert_fileinfo_equal(expected_library_info, actual_library_info)

    file_infos = @api.list_objects
    assert_fileinfo_equal(actual_library_info, file_infos[0])

    @api.get_object(library_filename)
    assert_match 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    soft_delete(library_filename)
  end

  def test_nonexistent_library
    filename = 'library.json'
    delete_all_library_versions(filename)

    soft_delete(filename) # Not a no-op - creates a delete marker

    Honeybadger.expects(:notify).never
    FirehoseClient.any_instance.expects(:put_record).never
    @api.get_object(filename)
    assert not_found?

    assert_newrelic_metrics %w(
      Custom/ListRequests/LibraryBucket/BucketHelper.list
    )
  end

  def test_library_versions
    filename = 'library.json'
    delete_all_library_versions(filename)

    # Create an library file
    v1_file_data = '{"library":"library"}'
    upload(filename, v1_file_data)

    # Overwrite it.
    v2_file_data = '{"library2":"library2"}'
    upload(filename, v2_file_data)

    # Delete it.
    soft_delete(filename)

    # List versions.
    versions = @api.list_object_versions(filename)
    assert successful?
    assert_equal 2, versions.count

    # Get the first and second version.
    assert_equal v1_file_data, @api.get_object_version(filename, versions.last['versionId'])
    assert_equal v2_file_data, @api.get_object_version(filename, versions.first['versionId'])

    # Check cache headers
    assert_match 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    assert_newrelic_metrics %w(
      Custom/ListRequests/LibraryBucket/BucketHelper.list
      Custom/ListRequests/LibraryBucket/BucketHelper.app_size
      Custom/ListRequests/LibraryBucket/BucketHelper.app_size
      Custom/ListRequests/LibraryBucket/BucketHelper.list_versions
    )
  end

  def test_404_on_malformed_version_id
    filename = 'library.json'
    file_data = '{"library":"library"}'
    file_headers = {'CONTENT_TYPE' => 'application/json'}
    delete_all_library_versions(filename)

    # Upload a file
    @api.put_object(filename, file_data, file_headers)
    assert successful?

    # Create a malformed version id
    bad_version_id = 'malformed-version-id'

    @api.get_object_version(filename, bad_version_id)
    assert_equal 404, last_response.status

    delete_all_library_versions(filename)
  end

  def test_400_with_profanity
    ShareFiltering.stubs(:find_failure).returns(ShareFailure.new('profanity', 'fart'))
    filename = 'library.json'
    file_data = '{"library":"fart"}'
    file_headers = {'CONTENT_TYPE' => 'application/json'}
    delete_all_library_versions(filename)

    # Upload a file
    @api.put_object(filename, file_data, file_headers)
    assert_equal 400, last_response.status
  end

  private

  #
  # Upload a new version of an library.
  # @param [String] filename of the library
  # @param [String] body of the library
  # @return [String] S3 version id of the newly uploaded library
  #
  def upload(filename, body)
    @api.put_object(filename, body, {'CONTENT_TYPE' => 'application/json'})
    assert successful?
    JSON.parse(last_response.body)['versionId']
  end

  #
  # Deletes the file via the API, which actually just puts a delete marker
  # on the end of its history.
  # @param [String] filename of the library
  #
  def soft_delete(filename)
    @api.delete_object(filename)
    assert successful?
  end

  def delete_all_library_versions(filename)
    delete_all_versions(CDO.libraries_s3_bucket, "libraries_test/1/1/#{filename}")
  end
end
