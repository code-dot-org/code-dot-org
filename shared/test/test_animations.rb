require_relative 'files_api_test_base' # Must be required first to establish load paths
require_relative 'files_api_test_helper'

class AnimationsTest < FilesApiTestBase

  def setup
    @channel_id = create_channel
    @api = FilesApiTestHelper.new(current_session, 'animations', @channel_id)
    @api.ensure_aws_credentials
  end

  def teardown
    # Require that tests delete the assets they upload
    get "v3/animations/#{@channel_id}"
    assert_empty JSON.parse(last_response.body)
    delete_channel(@channel_id)
    @channel_id = nil
  end

  def test_upload_animations
    dog_image_filename = @api.randomize_filename('dog.png')
    dog_image_body = 'stub-dog-contents'
    cat_image_filename = @api.randomize_filename('cat.png')
    cat_image_body = 'stub-cat-contents'

    # Make sure we have a clean starting point
    delete_all_animation_versions(dog_image_filename)
    delete_all_animation_versions(cat_image_filename)

    # Upload dog.png and check the response
    response = @api.post_file(dog_image_filename, dog_image_body, 'image/png')
    actual_dog_image_info = JSON.parse(response)
    expected_dog_image_info = {
      'filename' => dog_image_filename,
      'category' => 'image',
      'size' => dog_image_body.length
    }
    assert_fileinfo_equal(expected_dog_image_info, actual_dog_image_info)

    # Upload cat.png and check the response
    response = @api.post_file(cat_image_filename, cat_image_body, 'image/png')
    actual_cat_image_info = JSON.parse(response)
    expected_cat_image_info = {
      'filename' =>  cat_image_filename,
      'category' => 'image',
      'size' => cat_image_body.length
    }
    assert_fileinfo_equal(expected_cat_image_info, actual_cat_image_info)

    file_infos = @api.list_objects
    assert_fileinfo_equal(actual_cat_image_info, file_infos[0])
    assert_fileinfo_equal(actual_dog_image_info, file_infos[1])

    @api.get_object(dog_image_filename)
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    @api.delete_object(dog_image_filename)
    assert successful?

    @api.delete_object(cat_image_filename)
    assert successful?
  end

  def test_unsupported_media_type
    @api.post_file('executable.exe', 'stub-contents', 'application/x-msdownload')
    assert unsupported_media_type?
  end

  def test_allow_mismatched_mime_type
    mismatched_filename = @api.randomize_filename('mismatchedmimetype.png')
    delete_all_animation_versions(mismatched_filename)

    @api.post_file(mismatched_filename, 'stub-contents', 'application/gif')
    assert successful?

    @api.delete_object(mismatched_filename)
    assert successful?
  end

  def test_extension_case_sensitivity
    filename = @api.randomize_filename('casesensitive.PNG')
    different_case_filename = filename.gsub(/PNG$/, 'png')
    delete_all_animation_versions(filename)
    delete_all_animation_versions(different_case_filename)

    @api.post_file(filename, 'stub-contents', 'application/png')
    assert successful?

    @api.get_object(filename)
    assert successful?

    @api.get_object(different_case_filename)
    assert not_found?

    @api.delete_object(filename)
    assert successful?
  end

  def test_nonexistent_animation
    filename = @api.randomize_filename('nonexistent.png')
    delete_all_animation_versions(filename)

    @api.delete_object(filename) # Not a no-op - creates a delete marker
    assert successful?

    @api.get_object(filename)
    assert not_found?
  end

  def test_copy_animation
    source_image_filename = @api.randomize_filename('copy_source.png')
    source_image_body = 'stub-source-contents'
    dest_image_filename = @api.randomize_filename('copy_dest.png')

    # Make sure we have a clean starting point
    delete_all_animation_versions(source_image_filename)
    delete_all_animation_versions(dest_image_filename)

    # Upload copy_source.png and check the response
    @api.post_file(source_image_filename, source_image_body, 'image/png')
    assert successful?

    # Copy copy_source.png to copy_dest.png
    @api.copy_object(source_image_filename, dest_image_filename)
    assert successful?

    # Get copy_dest.png and make sure it's got the source content
    @api.get_object(dest_image_filename)
    assert_equal source_image_body, @api.get_object(dest_image_filename)
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    @api.delete_object(source_image_filename)
    assert successful?

    @api.delete_object(dest_image_filename)
    assert successful?
  end

  def test_copy_nonexistent_animation
    source_image_filename = @api.randomize_filename('copy_nonexistent_source.png')
    dest_image_filename = @api.randomize_filename('copy_nonexistent_dest.png')

    # Make sure we have a clean starting point
    delete_all_animation_versions(source_image_filename)
    delete_all_animation_versions(dest_image_filename)

    # Try to copy nonexistent source to destination
    @api.copy_object(source_image_filename, dest_image_filename)
    assert not_found?
  end

  def test_animation_versions
    filename = @api.randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    v1_file_data = 'stub-v1-body'
    @api.post_file(filename, v1_file_data, 'image/png')
    assert successful?

    # Overwrite it.
    v2_file_data = 'stub-v2-body'
    @api.post_file(filename, v2_file_data, 'image/png')
    assert successful?

    # Delete it.
    @api.delete_object(filename)
    assert successful?

    # List versions.
    versions = @api.list_object_versions(filename)
    assert successful?
    assert_equal 2, versions.count

    # Get the first and second version.
    assert_equal v1_file_data, @api.get_object_version(filename, versions.last['versionId'])
    assert_equal v2_file_data, @api.get_object_version(filename, versions.first['versionId'])

    # Check cache headers
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']
  end

  def test_replace_animation_version
    filename = @api.randomize_filename('replaceme.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    v1_file_data = 'stub-v1-body'
    @api.post_file(filename, v1_file_data, 'image/png')
    assert successful?
    original_version_id = JSON.parse(last_response.body)['versionId']

    # Overwrite it, specifying the same version
    v2_file_data = 'stub-v2-body'
    @api.post_file_version(filename, original_version_id, v2_file_data, 'image/png')
    new_version_id = JSON.parse(last_response.body)['versionId']
    assert successful?

    # Make sure only one version exists
    versions = @api.list_object_versions(filename)
    assert successful?
    assert_equal 1, versions.count
    assert_equal new_version_id, versions[0]['versionId']

    # Note that even though we replaced a version, the version ID changed.
    refute_equal original_version_id, new_version_id

    # Make sure that one version has the newest content
    assert_equal v2_file_data, @api.get_object_version(filename, new_version_id)

    @api.delete_object(filename)
  end

  private

  def delete_all_animation_versions(filename)
    delete_all_versions(CDO.animations_s3_bucket, "animations_test/1/1/#{filename}")
  end

end
