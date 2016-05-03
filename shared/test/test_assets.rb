require_relative 'files_api_test_base' # Must be required first to establish load paths
require_relative 'files_api_test_helper'
require 'helpers/asset_bucket'
require_relative 'spy_newrelic_agent'

class AssetsTest < FilesApiTestBase

  def setup
    # Ensure the s3 path starts empty.
    delete_all_assets('assets_test/1/1')

    @channel_id = create_channel
    @api = FilesApiTestHelper.new(current_session, 'assets', @channel_id)
  end

  def teardown
    delete_channel(@channel_id)
  end

  def test_assets
    @api.ensure_aws_credentials

    image_body = 'stub-image-contents'
    response, image_filename = post_asset_file(@api, 'dog.jpg', image_body, 'image/jpeg')

    actual_image_info = JSON.parse(response)
    expected_image_info = {'filename' => image_filename, 'category' => 'image', 'size' => image_body.length}
    assert_fileinfo_equal(expected_image_info, actual_image_info)

    sound_body = 'stub-sound-contents'
    response, sound_filename = post_asset_file(@api, 'woof.mp3', sound_body, 'audio/mpeg')

    actual_sound_info = JSON.parse(response)
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}
    assert_fileinfo_equal(expected_sound_info, actual_sound_info)

    file_infos = @api.list_objects
    assert_fileinfo_equal(actual_image_info, file_infos[0])
    assert_fileinfo_equal(actual_sound_info, file_infos[1])

    @api.get_object(image_filename)
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    @api.delete_object(image_filename)
    assert successful?

    @api.delete_object(sound_filename)
    assert successful?

    # unsupported media type
    post_asset_file(@api, 'filename.exe', 'stub-contents', 'application/x-msdownload')
    assert unsupported_media_type?

    # mismatched file extension and mime type
    _, mismatched_filename = post_asset_file(@api, 'filename.jpg', 'stub-contents', 'application/gif')
    assert successful?
    @api.delete_object(mismatched_filename)
    assert successful?

    # file extension case insensitivity
    _, filename = post_asset_file(@api, 'filename.JPG', 'stub-contents', 'application/jpeg')
    assert successful?
    @api.get_object(filename)
    assert successful?
    @api.get_object(filename.gsub(/JPG$/, 'jpg'))
    assert not_found?
    @api.delete_object(filename)
    assert successful?

    # invalid files are not uploaded, and other added files were deleted
    file_infos = @api.list_objects
    assert_equal 0, file_infos.length

    @api.delete_object('nonexistent.jpg')
    assert successful?

    @api.get_object('nonexistent.jpg')
    assert not_found?
  end

  def test_set_abuse_score
    asset_bucket = AssetBucket.new

    # create a couple assets without an abuse score
    _, first_asset = post_asset_file(@api, 'asset1.jpg', 'stub-image-contents', 'image/jpeg')
    _, second_asset = post_asset_file(@api, 'asset2.jpg', 'stub-image-contents', 'image/jpeg')

    result = @api.get_object(first_asset)
    assert_equal 'stub-image-contents', result

    assert_equal 0, asset_bucket.get_abuse_score(@channel_id, first_asset)
    assert_equal 0, asset_bucket.get_abuse_score(@channel_id, second_asset)

    # set abuse score
    @api.patch_abuse(10)
    assert_equal 10, asset_bucket.get_abuse_score(@channel_id, first_asset)
    assert_equal 10, asset_bucket.get_abuse_score(@channel_id, second_asset)

    # make sure we didnt blow away contents
    result = @api.get_object(first_asset)
    assert_equal 'stub-image-contents', result

    # increment
    @api.patch_abuse(20)
    assert_equal 20, asset_bucket.get_abuse_score(@channel_id, first_asset)
    assert_equal 20, asset_bucket.get_abuse_score(@channel_id, second_asset)

    # set to be the same
    @api.patch_abuse(20)
    assert successful?
    assert_equal 20, asset_bucket.get_abuse_score(@channel_id, first_asset)
    assert_equal 20, asset_bucket.get_abuse_score(@channel_id, second_asset)

    # non-admin can't decrement
    @api.patch_abuse(0)
    refute successful?
    assert_equal 20, asset_bucket.get_abuse_score(@channel_id, first_asset)
    assert_equal 20, asset_bucket.get_abuse_score(@channel_id, second_asset)

    # admin can decrement
    FilesApi.any_instance.stubs(:admin?).returns(true)
    @api.patch_abuse(0)
    assert successful?
    assert_equal 0, asset_bucket.get_abuse_score(@channel_id, first_asset)
    assert_equal 0, asset_bucket.get_abuse_score(@channel_id, second_asset)

    # make sure we didnt blow away contents
    result = @api.get_object(first_asset)
    assert_equal 'stub-image-contents', result
    FilesApi.any_instance.unstub(:admin?)

    @api.delete_object(first_asset)
    @api.delete_object(second_asset)
  end

  def test_viewing_abusive_assets
    _, asset_name = post_asset_file(@api, 'abusive_asset.jpg', 'stub-image-contents', 'image/jpeg')

    # owner can view
    @api.get_object(asset_name)
    assert successful?

    # non-owner can view
    with_session(:non_owner) do
      non_owner_api = FilesApiTestHelper.new(current_session, 'assets', @channel_id)
      non_owner_api.get_object(asset_name)
      assert successful?
    end

    # set abuse
    @api.patch_abuse(10)

    # owner can view
    @api.get_object(asset_name)
    assert successful?

    # non-owner cannot view
    with_session(:non_owner) do
      non_owner_api = FilesApiTestHelper.new(current_session, 'assets', @channel_id)
      non_owner_api.get_object(asset_name)
      refute successful?
    end

    # admin can view
    with_session(:admin) do
      admin_api = FilesApiTestHelper.new(current_session, 'assets', @channel_id)
      FilesApi.any_instance.stubs(:admin?).returns(true)
      admin_api.get_object(asset_name)
      assert successful?
      FilesApi.any_instance.unstub(:admin?)
    end

    # teacher can view
    with_session(:teacher) do
      teacher_api = FilesApiTestHelper.new(current_session, 'assets', @channel_id)
      FilesApi.any_instance.stubs(:teaches_student?).returns(true)
      teacher_api.get_object(asset_name)
      assert successful?
      FilesApi.any_instance.unstub(:teaches_student?)
    end

    @api.delete_object(asset_name)
  end

  def test_assets_copy_all
    # This test creates 2 channels
    delete_all_assets('assets_test/1/2')
    dest_channel_id = create_channel
    src_api = FilesApiTestHelper.new(current_session, 'assets', @channel_id)
    dest_api = FilesApiTestHelper.new(current_session, 'assets', dest_channel_id)

    image_filename = 'çat.jpg'
    image_body = 'stub-image-contents'

    sound_filename = 'woof.mp3'
    sound_body = 'stub-sound-contents'

    _, image_filename = post_asset_file(src_api, image_filename, image_body, 'image/jpeg')
    _, sound_filename = post_asset_file(src_api, sound_filename, sound_body, 'audio/mpeg')
    src_api.patch_abuse(10)

    expected_image_info = {'filename' =>  image_filename, 'category' =>  'image', 'size' =>  image_body.length}
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}

    copy_file_infos = JSON.parse(copy_all(@channel_id, dest_channel_id))
    dest_file_infos = dest_api.list_objects

    assert_fileinfo_equal(expected_image_info, copy_file_infos[1])
    assert_fileinfo_equal(expected_sound_info, copy_file_infos[0])
    assert_fileinfo_equal(expected_image_info, dest_file_infos[1])
    assert_fileinfo_equal(expected_sound_info, dest_file_infos[0])

    # abuse score didn't carry over
    assert_equal 0, AssetBucket.new.get_abuse_score(dest_channel_id, image_filename)
    assert_equal 0, AssetBucket.new.get_abuse_score(dest_channel_id, sound_filename)

    src_api.delete_object(URI.encode(image_filename))
    src_api.delete_object(sound_filename)
    dest_api.delete_object(URI.encode(image_filename))
    dest_api.delete_object(sound_filename)
    delete_channel(dest_channel_id)
  end

  def test_assets_auth
    basename = 'dog.jpg'
    body = 'stub-image-contents'
    content_type = 'image/jpeg'

    # post_asset_file create a new file/temp filename, so we post twice using the same file here instead
    file, filename = @api.create_temp_file(basename, body, content_type)

    post_asset(@api, file)
    assert successful?, 'Owner can add a file'

    with_session(:non_owner) do
      non_owner_api = FilesApiTestHelper.new(current_session, 'assets', @channel_id)
      non_owner_api.get_object(filename)
      assert successful?, 'Non-owner can read a file'

      post_asset(non_owner_api, file)
      assert last_response.client_error?, 'Non-owner cannot write a file'

      non_owner_api.delete_object(filename)
      refute successful?, 'Non-owner cannot delete a file'
    end

    @api.delete_object(filename)
  end

  def test_assets_quota
    FilesApi.any_instance.stubs(:max_file_size).returns(5)
    FilesApi.any_instance.stubs(:max_app_size).returns(10)

    post_asset_file(@api, "file1.jpg", "1234567890ABC", 'image/jpeg')
    assert last_response.client_error?, "Error when file is larger than max file size."

    _, added_filename1 = post_asset_file(@api, "file2.jpg", "1234", 'image/jpeg')
    assert successful?, "First small file upload is successful."

    _, added_filename2 = post_asset_file(@api, "file3.jpg", "5678", 'image/jpeg')
    assert successful?, "Second small file upload is successful."

    post_asset_file(@api, "file4.jpg", "ABCD", 'image/jpeg')
    assert last_response.client_error?, "Error when exceeding max app size."

    @api.delete_object(added_filename1)
    @api.delete_object(added_filename2)

    assert @api.list_objects.empty?, "No unexpected assets were written to storage."

    FilesApi.any_instance.unstub(:max_file_size)
    FilesApi.any_instance.unstub(:max_app_size)
  end

  def test_assets_quota_newrelic_logging
    FilesApi.any_instance.stubs(:max_file_size).returns(5)
    FilesApi.any_instance.stubs(:max_app_size).returns(10)
    CDO.stub(:newrelic_logging, true) do
      post_asset_file(@api, "file1.jpg", "1234567890ABC", 'image/jpeg')
      assert last_response.client_error?, "Error when file is larger than max file size."

      assert_assets_custom_metric 1, 'FileTooLarge'

      _, filetodelete1 = post_asset_file(@api, "file2.jpg", "1234", 'image/jpeg')
      assert successful?, "First small file upload is successful."

      assert_assets_custom_metric 1, 'FileTooLarge', 'still only one custom metric recorded'

      _, filetodelete2 = post_asset_file(@api, "file3.jpg", "5678", 'image/jpeg')
      assert successful?, "Second small file upload is successful."

      assert_assets_custom_metric 2, 'QuotaCrossedHalfUsed'
      assert_assets_custom_event 1, 'QuotaCrossedHalfUsed'

      post_asset_file(@api, "file4.jpg", "ABCD", 'image/jpeg')
      assert last_response.client_error?, "Error when exceeding max app size."

      assert_assets_custom_metric 3, 'QuotaExceeded'
      assert_assets_custom_event 2, 'QuotaExceeded'

      @api.delete_object(filetodelete1)
      @api.delete_object(filetodelete2)

      assert @api.list_objects.empty?, "No unexpected assets were written to storage."
    end
    FilesApi.any_instance.unstub(:max_file_size)
    FilesApi.any_instance.unstub(:max_app_size)
  end

  def test_asset_last_modified
    file, filename = @api.create_temp_file('test.png', 'version 1', 'image/png')

    post @channel_id, file
    @api.get_object filename
    v1_last_modified = last_response.headers['Last-Modified']

    # We can't Timecop here because the last-modified time needs to change on the server.
    sleep 1 if VCR.current_cassette.recording?

    post @channel_id, file
    @api.get_object filename, '', 'HTTP_IF_MODIFIED_SINCE' => v1_last_modified
    assert_equal 200, last_response.status
    v2_last_modified = last_response.headers['Last-Modified']

    @api.get_object filename, '', 'HTTP_IF_MODIFIED_SINCE' => v2_last_modified
    assert_equal 304, last_response.status
  end

  def test_invalid_mime_type_returns_unsupported_media_type
    @api.get_object 'filewithinvalidmimetype.asdasdas%25dasdasd'
    assert_equal 415, last_response.status # 415 = Unsupported media type
  end

  # Methods below this line are test utilities, not actual tests
  private

  def post_asset(api, uploaded_file)
    body = { files: [uploaded_file] }
    headers = { 'CONTENT_TYPE' => 'multipart/form-data' }
    api.post_object '', body, headers
  end

  def post_asset_file(api, filename, file_contents, content_type)
    file, tmp_filename = api.create_temp_file(filename, file_contents, content_type)
    response = post_asset(api, file)
    [response, tmp_filename]
  end

  def delete_all_assets(bucket)
    delete_all_objects(CDO.assets_s3_bucket, bucket)
  end

  def copy_all(src_channel_id, dest_channel_id)
    AssetBucket.new.copy_files(src_channel_id, dest_channel_id).to_json
  end

  def assert_assets_custom_metric(index, metric_type, length_msg = nil, expected_value = 1)
    # Filter out metrics from other test cases.
    metrics = NewRelic::Agent.get_metrics %r{^Custom/FilesApi}
    length_msg ||= "custom metrics recorded: #{index}"
    assert_equal index, metrics.length, length_msg
    last_metric = metrics.last
    assert_equal "Custom/FilesApi/#{metric_type}_assets", last_metric.first, "#{metric_type} metric recorded"
    assert_equal expected_value, last_metric.last, "#{metric_type} metric value"
  end

  def assert_assets_custom_event(index, event_type)
    # Filter out events from other test cases.
    events = NewRelic::Agent.get_events %r{^FilesApi}
    assert_equal index, events.length, "custom events recorded: #{index}"
    assert_equal "FilesApi#{event_type}", events.last.first, "#{event_type} event recorded"
  end
end
