require_relative 'files_api_test_base' # Must be required first to establish load paths
require_relative 'files_api_test_helper'

class AnimationsTest < FilesApiTestBase
  def setup
    NewRelic::Agent.reset_stub
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
      'filename' => cat_image_filename,
      'category' => 'image',
      'size' => cat_image_body.length
    }
    assert_fileinfo_equal(expected_cat_image_info, actual_cat_image_info)

    file_infos = @api.list_objects
    assert_fileinfo_equal(actual_cat_image_info, file_infos[0])
    assert_fileinfo_equal(actual_dog_image_info, file_infos[1])

    @api.get_object(dog_image_filename)
    assert_match 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.list
    )

    soft_delete(dog_image_filename)
    soft_delete(cat_image_filename)
  end

  def test_unsupported_media_type
    @api.post_file('executable.exe', 'stub-contents', 'application/x-msdownload')
    assert unsupported_media_type?
    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
    )
  end

  def test_allow_mismatched_mime_type
    mismatched_filename = @api.randomize_filename('mismatchedmimetype.png')
    delete_all_animation_versions(mismatched_filename)

    @api.post_file(mismatched_filename, 'stub-contents', 'application/gif')
    assert successful?

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
    )

    soft_delete(mismatched_filename)
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

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
    )

    soft_delete(filename)
  end

  def test_nonexistent_animation
    filename = @api.randomize_filename('nonexistent.png')
    delete_all_animation_versions(filename)

    soft_delete(filename) # Not a no-op - creates a delete marker

    Honeybadger.expects(:notify).never
    FirehoseClient.any_instance.expects(:put_record).never
    @api.get_object(filename)
    assert not_found?

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
    )
  end

  def test_get_bad_version_returns_latest_version
    # We have a number of projects with known incorrect version ids in their
    # animation manifest. As a recovery action, when the client asks for an
    # animation and the animation exists but the particular version they asked
    # for does not, we will send back the latest version of that animation.
    filename = @api.randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Create and replace our first version, so we have a known missing version id
    v1_version_id = upload(filename, 'stub-v1-body')
    v1b_version_id = replace_version(filename, v1_version_id, 'stub-v1b-body')
    refute_equal v1_version_id, v1b_version_id

    # Create a second version
    v2_file_data = 'stub-v2-body'
    upload(filename, v2_file_data)

    # Ask for the missing version
    Honeybadger.expects(:notify).never
    FirehoseClient.any_instance.expects(:put_record).once
    @api.get_object_version(filename, v1_version_id)
    assert successful?

    # Check that we got the latest version
    assert_equal v2_file_data, last_response.body

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/AnimationBucket.s3_get_object(B)
    )

    delete_all_animation_versions(filename)
  end

  def test_get_bad_version_returns_latest_nondeleted_version
    # As above, but if the latest version of the animation is "deleted" we want
    # to send back the most recent non-deleted version of the animation, which
    # is probably as close as we can get to what the client is searching for.
    filename = @api.randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Create and replace our first version, so we have a known missing version id
    v1_version_id = upload(filename, 'stub-v1-body')
    v1b_version_id = replace_version(filename, v1_version_id, 'stub-v1b-body')
    refute_equal v1_version_id, v1b_version_id

    # Create a second version
    v2_file_data = 'stub-v2-body'
    upload(filename, v2_file_data)

    # Delete the animation
    soft_delete(filename)

    # Ask for the missing version
    Honeybadger.expects(:notify).never
    FirehoseClient.any_instance.expects(:put_record).once
    @api.get_object_version(filename, v1_version_id)
    assert successful?

    # Check that we got the last version before the delete
    assert_equal v2_file_data, last_response.body

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/AnimationBucket.s3_get_object(B)
    )

    delete_all_animation_versions(filename)
  end

  def test_get_bad_version_is_404_when_all_versions_are_deleted
    filename = @api.randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Create an animation
    v1_version_id = upload(filename, 'stub-v1-body')

    # Delete every version (clean slate)
    delete_all_animation_versions(filename)

    # Ask for an invalid version
    Honeybadger.expects(:notify).never
    # No Firehose notification on this case - it's an expected 404.
    FirehoseClient.any_instance.expects(:put_record).never
    @api.get_object_version(filename, v1_version_id)
    assert not_found?

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/AnimationBucket.s3_get_object(B)
    )
  end

  def test_copy_animation
    source_image_filename = @api.randomize_filename('copy_source.png')
    source_image_body = 'stub-source-contents'
    dest_image_filename = @api.randomize_filename('copy_dest.png')

    # Make sure we have a clean starting point
    delete_all_animation_versions(source_image_filename)
    delete_all_animation_versions(dest_image_filename)

    # Upload copy_source.png and check the response
    upload(source_image_filename, source_image_body)

    # Copy copy_source.png to copy_dest.png
    @api.copy_object(source_image_filename, dest_image_filename)
    assert successful?

    # Get copy_dest.png and make sure it's got the source content
    @api.get_object(dest_image_filename)
    assert_equal source_image_body, @api.get_object(dest_image_filename)
    assert_match 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.object_and_app_size
    )

    soft_delete(source_image_filename)
    soft_delete(dest_image_filename)
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

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.object_and_app_size
    )
  end

  def test_copy_abusive_animation
    source_image_filename = @api.randomize_filename('copy_source.png')
    source_image_body = 'stub-source-contents'
    dest_image_filename = @api.randomize_filename('copy_dest.png')

    # Make sure we have a clean starting point
    delete_all_animation_versions(source_image_filename)
    delete_all_animation_versions(dest_image_filename)
    upload(source_image_filename, source_image_body)

    # Set the abuse score for the source image
    @api.patch_abuse(10)
    animation_bucket = AnimationBucket.new
    assert_equal 10, animation_bucket.get_abuse_score(@channel_id, source_image_filename)

    # Copy copy_source.png to copy_dest.png
    @api.copy_object(source_image_filename, dest_image_filename)
    assert successful?

    # Verify that the destination image has the same abuse score
    assert_equal 10, animation_bucket.get_abuse_score(@channel_id, dest_image_filename)

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.object_and_app_size
    )

    soft_delete(source_image_filename)
    soft_delete(dest_image_filename)
  end

  def test_animation_versions
    filename = @api.randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    v1_file_data = 'stub-v1-body'
    upload(filename, v1_file_data)

    # Overwrite it.
    v2_file_data = 'stub-v2-body'
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
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.list_versions
    )
  end

  def test_replace_animation_version
    filename = @api.randomize_filename('replaceme.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    original_version_id = upload(filename, 'stub-v1-body')

    # Overwrite it, specifying the same version
    v2_file_data = 'stub-v2-body'
    new_version_id = replace_version(filename, original_version_id, v2_file_data)

    # Make sure only one version exists
    versions = @api.list_object_versions(filename)
    assert successful?
    assert_equal 1, versions.count
    assert_equal new_version_id, versions[0]['versionId']

    # Note that even though we replaced a version, the version ID changed.
    refute_equal original_version_id, new_version_id

    # Make sure that one version has the newest content
    assert_equal v2_file_data, @api.get_object_version(filename, new_version_id)

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.list_versions
    )

    soft_delete(filename)
  end

  def test_restore_previous_animation
    filename = @api.randomize_filename('animation.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    v1_file_data = 'stub-v1-body'
    original_version_id = upload(filename, v1_file_data)

    # Overwrite it.
    v2_file_data = 'stub-v2-body'
    second_version_id = upload(filename, v2_file_data)

    # Restore
    response = restore_version(filename, original_version_id)
    restored_version_id = response[:version_id]
    restored_file_data = @api.get_object_version(filename, restored_version_id)

    #Check that the restored version id is neither of the previous version ids
    refute_equal original_version_id, restored_version_id
    refute_equal second_version_id, restored_version_id

    #Check that the restored body is the same as the one to which it was restored
    assert_equal v1_file_data, restored_file_data

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
    )

    soft_delete(filename)
  end

  def test_restore_previous_animation_with_invalid_version
    filename = @api.randomize_filename('animation.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    original_version_id = upload(filename, 'stub-v1-body')

    # Overwrite it.
    v2_file_data = 'stub-v2-body'
    second_version_id = upload(filename, v2_file_data)

    # Restore
    response = restore_version(filename, 'bad_version_id')
    restored_version_id = response[:version_id]
    restored_file_data = @api.get_object(filename, restored_version_id)
    restored_metadata = AnimationBucket.new.get(@channel_id, filename)[:metadata]

    # Check that the latest version is the restored version
    latest_file_data = @api.get_object(filename)
    assert_equal restored_file_data, latest_file_data

    #Check that the restored version id is neither of the previous version ids
    refute_equal original_version_id, restored_version_id
    refute_equal second_version_id, restored_version_id

    #Check that the restored body is the same as the most recent animation
    assert_equal v2_file_data, restored_file_data

    #Check that the metadata exists and includes the expected keys and values
    #Observed inconsistency with metadata using underline and hyphen - check both for resiliency
    assert_equal '0', restored_metadata['abuse-score'] ? restored_metadata['abuse-score'] : restored_metadata['abuse_score']
    refute_nil restored_metadata['failed-restore-at'] ? restored_metadata['failed-restore-at'] : restored_metadata['failed_restore_at']
    assert_equal 'bad_version_id', restored_metadata['failed-restore-from-version'] ? restored_metadata['failed-restore-from-version'] : restored_metadata['failed_restore_from_version']

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
    )

    soft_delete(filename)
  end

  def test_restore_deleted_animation_with_invalid_version_does_nothing
    filename = @api.randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    upload(filename, 'stub-v1-body')

    # Delete it.
    soft_delete(filename)

    # List object versions
    versions_old = @api.list_object_versions(filename)
    assert successful?

    # Attempt restore with bad version ID
    response = restore_version(filename, 'bad_version_id')

    # Response indicates mot modified
    assert_equal 'NOT_MODIFIED', response[:status]

    # List object versions, check nothing changed.
    versions_new = @api.list_object_versions(filename)
    assert_equal versions_old, versions_new

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.list_versions
      Custom/ListRequests/AnimationBucket/BucketHelper.list_versions
    )

    soft_delete(filename)
  end

  def test_doesnt_mask_unrelated_errors
    filename = @api.randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Stub copy_object to give an error
    BucketHelper.s3.stubs(:copy_object).raises("Test Error")

    # Create an animation file
    original_version_id = upload(filename, 'stub-v1-body')

    # Check that restoring raises an error per above stub
    assert_raises do
      restore_version(filename, original_version_id)
    end

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
    )

    soft_delete(filename)
  end

  def test_get_object_with_latest_version
    filename = @api.randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    upload(filename, 'stub-v1-body')
    latest_version_id = upload(filename, 'stub-v2-body')

    # Delete it.
    soft_delete(filename)

    # Attempt to get object with special key to get latestVersion
    response = AnimationBucket.new.get(@channel_id, filename, nil, 'latestVersion')
    assert_equal response[:version_id], latest_version_id

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/AnimationBucket.s3_get_object(A)
    )
  end

  def test_get_object_with_latest_version_of_non_deleted
    filename = @api.randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    upload(filename, 'stub-v1-body')
    latest_version_id = upload(filename, 'stub-v2-body')

    # Attempt to get object with special key to get latestVersion
    response = AnimationBucket.new.get(@channel_id, filename, nil, 'latestVersion')
    assert_equal response[:version_id], latest_version_id

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/BucketHelper.app_size
      Custom/ListRequests/AnimationBucket/AnimationBucket.s3_get_object(A)
    )

    soft_delete(filename)
  end

  def test_get_object_with_latest_version_for_missing_animation
    filename = @api.randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Attempt to get object with special key to get latestVersion
    response = AnimationBucket.new.get(@channel_id, filename, nil, 'latestVersion')
    assert_equal response[:status], 'NOT_FOUND'

    assert_newrelic_metrics %w(
      Custom/ListRequests/AnimationBucket/BucketHelper.list
      Custom/ListRequests/AnimationBucket/AnimationBucket.s3_get_object(A)
    )
  end

  private

  #
  # Upload a new version of an animation.
  # @param [String] filename of the animation
  # @param [String] body of the animation
  # @return [String] S3 version id of the newly uploaded animation
  #
  def upload(filename, body)
    @api.post_file(filename, body, 'image/png')
    assert successful?
    JSON.parse(last_response.body)['versionId']
  end

  #
  # Replace an existing version of an animation.
  # The old version is deleted.  The uploaded file gets a new version id.
  # @param [String] filename of the animation
  # @param [String] version to be deleted/replaced
  # @param [String] body of the animation
  # @return [String] S3 version id of the uploaded animation
  #
  def replace_version(filename, version, body)
    @api.post_file_version(filename, version, body, 'image/png')
    assert successful?
    JSON.parse(last_response.body)['versionId']
  end

  #
  # Deletes the file via the API, which actually just puts a delete marker
  # on the end of its history.
  # @param [String] filename of the animation
  #
  def soft_delete(filename)
    @api.delete_object(filename)
    assert successful?
  end

  def delete_all_animation_versions(filename)
    delete_all_versions(CDO.animations_s3_bucket, "animations_test/1/1/#{filename}")
  end

  #
  # Attempts to restore the file to the named version
  # @param [String] filename of the animation
  # @param [String] version - S3 version id
  def restore_version(filename, version)
    # We use AnimationBucket directly because there's no public API for this.
    # It does happen as part of a project restore though.
    AnimationBucket.new.restore_previous_version(@channel_id, filename, version, nil)
  end
end
