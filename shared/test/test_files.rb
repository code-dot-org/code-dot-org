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
      'filesVersionId' => ''
    }
    assert_equal(expected_empty_files, JSON.parse(last_response.body))
    delete_channel(@channel_id)
    @channel_id = nil
  end

  def test_copy_object
    file_data = 'fake-file-data'
    old_filename = @api.randomize_filename 'old_file.html'
    new_filename = @api.randomize_filename 'new_file.html'
    delete_all_file_versions old_filename, URI.escape(old_filename),
      new_filename, URI.escape(new_filename)
    delete_all_manifest_versions
    post_file_data @api, old_filename, file_data, 'test/html'

    @api.copy_object old_filename, new_filename

    assert successful?
    @api.get_object(new_filename)
    assert successful?
    assert_equal file_data, last_response.body
    @api.get_object(old_filename)
    assert successful?
    assert_equal file_data, last_response.body

    delete_all_manifest_versions
  end

  def test_rename_object
    file_data = 'fake-file-data'
    old_filename = @api.randomize_filename 'old_file.html'
    new_filename = @api.randomize_filename 'new_file.html'
    delete_all_file_versions old_filename, URI.escape(old_filename),
      new_filename, URI.escape(new_filename)
    delete_all_manifest_versions
    post_file_data @api, old_filename, file_data, 'test/html'

    @api.rename_object old_filename, new_filename
    assert successful?
    @api.get_object(new_filename)
    assert successful?
    assert_equal file_data, last_response.body
    @api.get_object(old_filename)
    assert not_found?

    @api.delete_object(new_filename)
    assert successful?

    delete_all_manifest_versions
  end

  def test_upload_files
    dog_image_filename = @api.randomize_filename('dog.png')
    dog_image_body = 'stub-dog-contents'
    cat_image_filename = @api.randomize_filename('cat.png')
    cat_image_body = 'stub-cat-contents'

    # Make sure we have a clean starting point
    delete_all_file_versions(dog_image_filename, cat_image_filename)
    delete_all_manifest_versions

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
    assert_equal dog_image_body, last_response.body

    @api.get_root_object(dog_image_filename, '', {'HTTP_HOST' => CDO.canonical_hostname('codeprojects.org')})
    assert_equal dog_image_body, last_response.body

    @api.delete_object(dog_image_filename)
    assert successful?

    @api.delete_object(cat_image_filename)
    assert successful?

    delete_all_manifest_versions
  end

  def test_content_disposition
    dog_image_filename = @api.randomize_filename('dog.png')
    dog_image_body = 'stub-dog-contents'
    html_filename = @api.randomize_filename('index.html')
    html_body = 'stub-html-contents'

    post_file_data(@api, dog_image_filename, dog_image_body, 'image/png')
    post_file_data(@api, html_filename, html_body, 'text/html')

    # Verify that we download non-whitelisted file types as an attachment when
    # hitting the normal GET api.

    @api.get_object(dog_image_filename)
    assert successful?
    assert_nil last_response['Content-Disposition']

    @api.get_object(html_filename)
    assert successful?
    assert_equal "attachment; filename=\"#{html_filename}\"", last_response['Content-Disposition']

    # Verify that we download the files without Content-Disposition when hitting
    # the codeprojects.org root URL.

    @api.get_root_object(dog_image_filename, '', {'HTTP_HOST' => CDO.canonical_hostname('codeprojects.org')})
    assert successful?
    assert_nil last_response['Content-Disposition']

    @api.get_root_object(html_filename, '', {'HTTP_HOST' => CDO.canonical_hostname('codeprojects.org')})
    assert successful?
    assert_nil last_response['Content-Disposition']

    @api.delete_object(dog_image_filename)
    assert successful?

    @api.delete_object(html_filename)
    assert successful?

    delete_all_manifest_versions
  end

  def test_allow_mismatched_mime_type
    mismatched_filename = @api.randomize_filename('mismatchedmimetype.png')
    delete_all_file_versions(mismatched_filename)
    delete_all_manifest_versions

    post_file_data(@api, mismatched_filename, 'stub-contents', 'application/gif')
    assert successful?

    @api.delete_object(mismatched_filename)
    assert successful?

    delete_all_manifest_versions
  end

  def test_escaping_insensitivity
    filename = @api.randomize_filename('has space.html')
    escaped_filename = URI.escape(filename)
    filename2 = @api.randomize_filename('another has spaces.html')
    escaped_filename2 = URI.escape(filename2)
    delete_all_file_versions(filename, escaped_filename, filename2, escaped_filename2)
    delete_all_manifest_versions

    post_file_data(@api, filename, 'stub-contents', 'test/html')
    assert successful?

    @api.get_object(escaped_filename)
    assert successful?

    @api.delete_object(escaped_filename)
    assert successful?

    post_file_data(@api, escaped_filename2, 'stub-contents-2', 'test/html')
    assert successful?

    @api.get_object(escaped_filename2)
    assert successful?

    @api.delete_object(escaped_filename2)
    assert successful?

    delete_all_manifest_versions
  end

  def test_case_insensitivity
    filename = @api.randomize_filename('casesensitive.PNG')
    different_case_filename = filename.gsub(/PNG$/, 'png')
    delete_all_file_versions(filename, different_case_filename)
    delete_all_manifest_versions

    post_file_data(@api, filename, 'stub-contents', 'application/png')
    assert successful?

    @api.get_object(filename)
    assert successful?

    @api.get_object(different_case_filename)
    assert successful?

    @api.delete_object(different_case_filename)
    assert successful?

    delete_all_manifest_versions
  end

  def test_nonexistent_file
    filename = @api.randomize_filename('nonexistent.png')
    dog_image_filename = @api.randomize_filename('dog.png')
    delete_all_file_versions(filename, dog_image_filename)
    delete_all_manifest_versions

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

    delete_all_manifest_versions
  end

  def test_file_versions
    filename = @api.randomize_filename('test.png')
    delete_all_file_versions(filename)
    delete_all_manifest_versions

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
    refute project_versions[1]['isLatest']
    refute project_versions[2]['isLatest']

    # Restore previous version
    @api.restore_files_version(project_versions[2]['versionId'])
    assert successful?
    assert_equal v1_file_data, @api.get_object(filename)

    # Delete it.
    @api.delete_object(filename)
    assert successful?

    delete_all_manifest_versions
  end

  def test_invalid_file_extension
    @api.get_object('bad_extension.css%22')
    assert unsupported_media_type?
  end

  def test_bad_channel_id
    bad_channel_id = 'undefined'
    api = FilesApiTestHelper.new(current_session, 'files', bad_channel_id)
    file_infos = api.list_objects
    assert_equal '', file_infos['filesVersionId']
    assert_equal [], file_infos['files']
  end

  def test_thumbnail
    thumbnail_filename = '.metadata/thumbnail.png'
    thumbnail_body = 'stub-dog-contents'

    @api.get_object(thumbnail_filename)
    assert not_found?

    @api.put_object(thumbnail_filename, thumbnail_body)
    assert successful?

    assert_equal thumbnail_body, @api.get_object(thumbnail_filename)

    @api.delete_object(thumbnail_filename)
    assert successful?

    @api.get_object(thumbnail_filename)
    assert not_found?
  end

  def test_metadata_auth
    thumbnail_filename = '.metadata/thumbnail.png'
    thumbnail_body = 'stub-thumbnail-contents'
    other_body = 'stub-other-contents'

    @api.get_object(thumbnail_filename)
    assert not_found?

    @api.put_object(thumbnail_filename, thumbnail_body)
    assert successful?

    with_session(:non_owner) do
      non_owner_api = FilesApiTestHelper.new(current_session, 'files', @channel_id)

      # non-owner can view
      assert_equal thumbnail_body, non_owner_api.get_object(thumbnail_filename)

      # non-owner cannot put
      non_owner_api.put_object(thumbnail_filename, other_body)
      refute successful?

      # non-owner cannot delete
      non_owner_api.delete_object(thumbnail_filename)
      refute successful?
    end

    # file contents has not changed
    assert_equal thumbnail_body, @api.get_object(thumbnail_filename)

    @api.delete_object(thumbnail_filename)
    assert successful?

    @api.get_object(thumbnail_filename)
    assert not_found?
  end

  def test_bogus_metadata
    bogus_metadata_filename = '.metadata/bogus.png'
    bogus_metadata_body = 'stub-bogus-metadata-contents'

    @api.get_object(bogus_metadata_filename)
    assert not_found?

    @api.put_object(bogus_metadata_filename, bogus_metadata_body)
    assert bad_request?

    @api.get_object(bogus_metadata_filename)
    assert not_found?

    @api.delete_object(bogus_metadata_filename)
    assert bad_request?

    @api.get_object(bogus_metadata_filename)
    assert not_found?
  end

  def test_metadata_cached
    thumbnail_filename = '.metadata/thumbnail.png'
    thumbnail_body = 'stub-thumbnail-contents'

    @api.put_object(thumbnail_filename, thumbnail_body)
    assert successful?

    get "/v3/files-public/#{@channel_id}/#{thumbnail_filename}"
    assert successful?
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']
  end

  def test_rename_mixed_case
    filename = @api.randomize_filename('Mixed Case With Spaces.html')
    escaped_filename = URI.escape(filename)
    filename2 = @api.randomize_filename('Another Mixed Case Spaces Name.html')
    escaped_filename2 = URI.escape(filename2)
    delete_all_file_versions(filename, filename2)
    delete_all_manifest_versions

    post_file_data(@api, filename, 'stub-contents', 'test/html')
    assert successful?

    @api.get_object(escaped_filename)
    assert successful?
    assert_equal 'stub-contents', last_response.body

    @api.rename_object(filename, escaped_filename2)
    assert successful?

    @api.get_object(escaped_filename2)
    assert successful?
    assert_equal 'stub-contents', last_response.body

    @api.get_object(escaped_filename)
    assert not_found?

    @api.delete_object(escaped_filename2)
    assert successful?

    delete_all_manifest_versions
  end

  private

  def post_file(api, uploaded_file)
    body = {files: [uploaded_file]}
    headers = {'CONTENT_TYPE' => 'multipart/form-data'}
    api.post_object '', body, headers
  end

  def post_file_data(api, filename, file_contents, content_type)
    file = api.create_uploaded_file(filename, file_contents, content_type)
    post_file(api, file)
  end

  def delete_all_file_versions(*filenames)
    filenames.each do |filename|
      delete_all_versions(CDO.files_s3_bucket, "files_test/1/1/#{filename}")
    end
  end

  def delete_all_manifest_versions
    delete_all_file_versions 'manifest.json'
  end
end
