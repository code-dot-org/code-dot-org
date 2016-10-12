require_relative 'files_api_test_base' # Must be required first to establish load paths
require_relative 'files_api_test_helper'

class FilesTest < FilesApiTestBase
  def setup
    @channel_id = create_channel
    @api = FilesApiTestHelper.new(current_session, 'files', @channel_id)
    @api.ensure_aws_credentials
  end

  def teardown
    # Require that tests delete the assets they upload
    get "v3/files/#{@channel_id}"
    expected_empty_files = {
      'files' => [],
      'filesVersionId' => 'unused'
    }
    assert_equal(expected_empty_files, JSON.parse(last_response.body))
    delete_channel(@channel_id)
    @channel_id = nil
  end

  def test_upload_files
    dog_image_filename = @api.randomize_filename('dog.png')
    dog_image_body = 'stub-dog-contents'
    cat_image_filename = @api.randomize_filename('cat.png')
    cat_image_body = 'stub-cat-contents'

    # Make sure we have a clean starting point
    delete_all_file_versions(dog_image_filename)
    delete_all_file_versions(cat_image_filename)
    delete_all_mainfest_versions

    # Upload dog.png and check the response
    response = post_file_data(@api, dog_image_filename, dog_image_body, 'image/png')
    actual_dog_image_info = JSON.parse(response)
    expected_dog_image_info = {
      'filename' => dog_image_filename,
      'category' => 'image',
      'size' => dog_image_body.length
    }
    assert_fileinfo_equal(expected_dog_image_info, actual_dog_image_info)

    # Upload cat.png and check the response
    response = post_file_data(@api, cat_image_filename, cat_image_body, 'image/png')
    actual_cat_image_info = JSON.parse(response)
    expected_cat_image_info = {
      'filename' => cat_image_filename,
      'category' => 'image',
      'size' => cat_image_body.length
    }
    assert_fileinfo_equal(expected_cat_image_info, actual_cat_image_info)

    file_infos = @api.list_objects
    assert_fileinfo_equal(actual_dog_image_info, file_infos['files'][0])
    assert_fileinfo_equal(actual_cat_image_info, file_infos['files'][1])

    @api.get_object(dog_image_filename)
    assert_equal 'private, must-revalidate, max-age=0', last_response['Cache-Control']

    @api.delete_object(dog_image_filename)
    assert successful?

    @api.delete_object(cat_image_filename)
    assert successful?

    delete_all_mainfest_versions
  end

  def test_allow_mismatched_mime_type
    mismatched_filename = @api.randomize_filename('mismatchedmimetype.png')
    delete_all_file_versions(mismatched_filename)
    delete_all_mainfest_versions

    post_file_data(@api, mismatched_filename, 'stub-contents', 'application/gif')
    assert successful?

    @api.delete_object(mismatched_filename)
    assert successful?

    delete_all_mainfest_versions
  end

  def test_case_insensitivity
    filename = @api.randomize_filename('casesensitive.PNG')
    different_case_filename = filename.gsub(/PNG$/, 'png')
    delete_all_file_versions(filename)
    delete_all_file_versions(different_case_filename)
    delete_all_mainfest_versions

    post_file_data(@api, filename, 'stub-contents', 'application/png')
    assert successful?

    @api.get_object(filename)
    assert successful?

    @api.get_object(different_case_filename)
    assert successful?

    @api.delete_object(different_case_filename)
    assert successful?

    delete_all_mainfest_versions
  end

  def test_nonexistent_file
    filename = @api.randomize_filename('nonexistent.png')
    dog_image_filename = @api.randomize_filename('dog.png')
    delete_all_file_versions(filename)
    delete_all_file_versions(dog_image_filename)
    delete_all_mainfest_versions

    # Check for file when no manifest is present:
    @api.get_object(filename)
    assert not_found?

    dog_image_body = 'stub-dog-contents'
    post_file_data(@api, dog_image_filename, dog_image_body, 'image/png')
    assert successful?

    # Check again for file when another file is now present:
    @api.get_object(filename)
    assert not_found?

    @api.delete_object(dog_image_filename)
    assert successful?

    delete_all_mainfest_versions
  end

  def test_file_versions
    filename = @api.randomize_filename('test.png')
    delete_all_file_versions(filename)
    delete_all_mainfest_versions

    # Create an animation file
    v1_file_data = 'stub-v1-body'
    post_file_data(@api, filename, v1_file_data, 'image/png')
    assert successful?

    # Overwrite it.
    v2_file_data = 'stub-v2-body'
    post_file_data(@api, filename, v2_file_data, 'image/png')
    assert successful?

    # Delete it.
    @api.delete_object(filename)
    assert successful?

    # List versions.
    versions = @api.list_object_versions(filename)
    assert successful?
    assert_equal 2, versions.count

    # Get the first and second version.
    assert_equal v1_file_data, @api.get_object_version(filename, versions[1]['versionId'])
    assert_equal v2_file_data, @api.get_object_version(filename, versions[0]['versionId'])

    # Check cache headers
    assert_equal 'private, must-revalidate, max-age=0', last_response['Cache-Control']

    # List project versions.
    project_versions = @api.list_files_versions
    assert successful?
    assert_equal 3, project_versions.count
    assert project_versions[0]['isLatest']
    assert !project_versions[1]['isLatest']
    assert !project_versions[2]['isLatest']

    # Restore previous version
    @api.restore_files_version(project_versions[2]['versionId'])
    assert successful?
    assert_equal v1_file_data, @api.get_object(filename)

    # Delete it.
    @api.delete_object(filename)
    assert successful?

    delete_all_mainfest_versions
  end

  private

  def post_file(api, uploaded_file)
    body = { files: [uploaded_file] }
    headers = { 'CONTENT_TYPE' => 'multipart/form-data' }
    api.post_object '', body, headers
  end

  def post_file_data(api, filename, file_contents, content_type)
    file = api.create_uploaded_file(filename, file_contents, content_type)
    post_file(api, file)
  end

  def delete_all_file_versions(filename)
    delete_all_versions(CDO.files_s3_bucket, "files_test/1/1/#{filename}")
  end

  def delete_all_mainfest_versions
    delete_all_file_versions 'manifest.json'
  end
end
