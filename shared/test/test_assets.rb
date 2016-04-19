require_relative 'files_api_test_base' # Must be required first to establish load paths
require 'helpers/asset_bucket'
require_relative 'spy_newrelic_agent'

class AssetsTest < FilesApiTestBase

  def setup
    # Ensure the s3 path starts empty.
    delete_all_objects('cdo-v3-assets', 'assets_test/1/1')
    @random = Random.new(0)
  end

  def test_assets
    channel_id = create_channel

    ensure_aws_credentials('assets', channel_id)

    image_body = 'stub-image-contents'
    response, image_filename = post_file(channel_id, 'dog.jpg', image_body, 'image/jpeg')

    actual_image_info = JSON.parse(response)
    expected_image_info = {'filename' => image_filename, 'category' => 'image', 'size' => image_body.length}
    assert_fileinfo_equal(expected_image_info, actual_image_info)

    sound_body = 'stub-sound-contents'
    response, sound_filename = post_file(channel_id, 'woof.mp3', sound_body, 'audio/mpeg')

    actual_sound_info = JSON.parse(response)
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}
    assert_fileinfo_equal(expected_sound_info, actual_sound_info)

    file_infos = list_assets(channel_id)
    assert_fileinfo_equal(actual_image_info, file_infos[0])
    assert_fileinfo_equal(actual_sound_info, file_infos[1])

    get_object(channel_id, image_filename)
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    delete_object(channel_id, image_filename)
    assert successful?

    delete_object(channel_id, sound_filename)
    assert successful?

    # unsupported media type
    post_file(channel_id, 'filename.exe', 'stub-contents', 'application/x-msdownload')
    assert unsupported_media_type?

    # mismatched file extension and mime type
    _, mismatched_filename = post_file(channel_id, 'filename.jpg', 'stub-contents', 'application/gif')
    assert successful?
    delete_object(channel_id, mismatched_filename)
    assert successful?

    # file extension case insensitivity
    _, filename = post_file(channel_id, 'filename.JPG', 'stub-contents', 'application/jpeg')
    assert successful?
    get_object(channel_id, filename)
    assert successful?
    get_object(channel_id, filename.gsub(/JPG$/, 'jpg'))
    assert not_found?
    delete_object(channel_id, filename)
    assert successful?

    # invalid files are not uploaded, and other added files were deleted
    file_infos = list_assets(channel_id)
    assert_equal 0, file_infos.length

    delete_object(channel_id, 'nonexistent.jpg')
    assert successful?

    get_object(channel_id, 'nonexistent.jpg')
    assert not_found?

    delete_channel(channel_id)
  end

  def test_set_abuse_score
    channel_id = create_channel
    asset_bucket = AssetBucket.new

    # create a couple assets without an abuse score
    _, first_asset = post_file(channel_id, 'asset1.jpg', 'stub-image-contents', 'image/jpeg')
    _, second_asset = post_file(channel_id, 'asset2.jpg', 'stub-image-contents', 'image/jpeg')

    result = get_object(channel_id, first_asset)
    assert_equal 'stub-image-contents', result

    assert_equal 0, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 0, asset_bucket.get_abuse_score(channel_id, second_asset)

    # set abuse score
    patch_abuse(channel_id, 10)
    assert_equal 10, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 10, asset_bucket.get_abuse_score(channel_id, second_asset)

    # make sure we didnt blow away contents
    result = get_object(channel_id, first_asset)
    assert_equal 'stub-image-contents', result

    # increment
    patch_abuse(channel_id, 20)
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, second_asset)

    # set to be the same
    patch_abuse(channel_id, 20)
    assert successful?
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, second_asset)

    # non-admin can't decrement
    patch_abuse(channel_id, 0)
    refute successful?
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, second_asset)

    # admin can decrement
    FilesApi.any_instance.stubs(:admin?).returns(true)
    patch_abuse(channel_id, 0)
    assert successful?
    assert_equal 0, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 0, asset_bucket.get_abuse_score(channel_id, second_asset)

    # make sure we didnt blow away contents
    result = get_object(channel_id, first_asset)
    assert_equal 'stub-image-contents', result
    FilesApi.any_instance.unstub(:admin?)

    delete_object(channel_id, first_asset)
    delete_object(channel_id, second_asset)
    delete_channel(channel_id)
  end

  def test_viewing_abusive_assets
    channel_id = create_channel

    _, asset_name = post_file(channel_id, 'abusive_asset.jpg', 'stub-image-contents', 'image/jpeg')

    # owner can view
    get_object(channel_id, asset_name)
    assert successful?

    # non-owner can view
    with_session(:non_owner) do
      get_object(channel_id, asset_name)
      assert successful?
    end

    # set abuse
    patch_abuse(channel_id, 10)

    # owner can view
    get_object(channel_id, asset_name)
    assert successful?

    # non-owner cannot view
    with_session(:non_owner) do
      get_object(channel_id, asset_name)
      refute successful?
    end

    # admin can view
    with_session(:admin) do
      FilesApi.any_instance.stubs(:admin?).returns(true)
      get_object(channel_id, asset_name)
      assert successful?
      FilesApi.any_instance.unstub(:admin?)
    end

    # teacher can view
    with_session(:teacher) do
      FilesApi.any_instance.stubs(:teaches_student?).returns(true)
      get_object(channel_id, asset_name)
      assert successful?
      FilesApi.any_instance.unstub(:teaches_student?)
    end

    delete_object(channel_id, asset_name)
    delete_channel(channel_id)
  end

  def test_assets_copy_all
    # This test creates 2 channels
    delete_all_objects('cdo-v3-assets', 'assets_test/1/2')
    src_channel_id = create_channel
    dest_channel_id = create_channel

    image_filename = 'çat.jpg'
    image_body = 'stub-image-contents'

    sound_filename = 'woof.mp3'
    sound_body = 'stub-sound-contents'

    _, image_filename = post_file(src_channel_id, image_filename, image_body, 'image/jpeg')
    _, sound_filename = post_file(src_channel_id, sound_filename, sound_body, 'audio/mpeg')
    patch_abuse(src_channel_id, 10)

    expected_image_info = {'filename' =>  image_filename, 'category' =>  'image', 'size' =>  image_body.length}
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}

    copy_file_infos = JSON.parse(copy_all(src_channel_id, dest_channel_id))
    dest_file_infos = list_assets(dest_channel_id)

    assert_fileinfo_equal(expected_image_info, copy_file_infos[1])
    assert_fileinfo_equal(expected_sound_info, copy_file_infos[0])
    assert_fileinfo_equal(expected_image_info, dest_file_infos[1])
    assert_fileinfo_equal(expected_sound_info, dest_file_infos[0])

    # abuse score didn't carry over
    assert_equal 0, AssetBucket.new.get_abuse_score(dest_channel_id, image_filename)
    assert_equal 0, AssetBucket.new.get_abuse_score(dest_channel_id, sound_filename)

    delete_object(src_channel_id, URI.encode(image_filename))
    delete_object(src_channel_id, sound_filename)
    delete_object(dest_channel_id, URI.encode(image_filename))
    delete_object(dest_channel_id, sound_filename)
    delete_channel(src_channel_id)
    delete_channel(dest_channel_id)
  end

  def test_assets_auth
    owner_channel_id = create_channel

    basename = 'dog.jpg'
    body = 'stub-image-contents'
    content_type = 'image/jpeg'

    # post_file create a new file/temp filename, so we post twice using the same file here instead
    file, filename = create_uploaded_file(basename, body, content_type)

    post_object(owner_channel_id, file)
    assert successful?, 'Owner can add a file'

    with_session(:non_owner) do
      get_object(owner_channel_id, filename)
      assert successful?, 'Non-owner can read a file'

      post_object(owner_channel_id, file)
      assert last_response.client_error?, 'Non-owner cannot write a file'

      delete_object(owner_channel_id, filename)
      refute successful?, 'Non-owner cannot delete a file'
    end

    delete_object(owner_channel_id, filename)
  end

  def test_assets_quota
    FilesApi.any_instance.stubs(:max_file_size).returns(5)
    FilesApi.any_instance.stubs(:max_app_size).returns(10)
    channel_id = create_channel

    post_file(channel_id, "file1.jpg", "1234567890ABC", 'image/jpeg')
    assert last_response.client_error?, "Error when file is larger than max file size."

    _, added_filename1 = post_file(channel_id, "file2.jpg", "1234", 'image/jpeg')
    assert successful?, "First small file upload is successful."

    _, added_filename2 = post_file(channel_id, "file3.jpg", "5678", 'image/jpeg')
    assert successful?, "Second small file upload is successful."

    post_file(channel_id, "file4.jpg", "ABCD", 'image/jpeg')
    assert last_response.client_error?, "Error when exceeding max app size."

    delete_object(channel_id, added_filename1)
    delete_object(channel_id, added_filename2)

    assert (list_assets(channel_id).empty?), "No unexpected assets were written to storage."

    delete_channel(channel_id)
    FilesApi.any_instance.unstub(:max_file_size)
    FilesApi.any_instance.unstub(:max_app_size)
  end

  def test_assets_quota_newrelic_logging
    FilesApi.any_instance.stubs(:max_file_size).returns(5)
    FilesApi.any_instance.stubs(:max_app_size).returns(10)
    CDO.stub(:newrelic_logging, true) do
      channel_id = create_channel

      post_file(channel_id, "file1.jpg", "1234567890ABC", 'image/jpeg')
      assert last_response.client_error?, "Error when file is larger than max file size."

      assert_assets_custom_metric 1, 'FileTooLarge'

      _, filetodelete1 = post_file(channel_id, "file2.jpg", "1234", 'image/jpeg')
      assert successful?, "First small file upload is successful."

      assert_assets_custom_metric 1, 'FileTooLarge', 'still only one custom metric recorded'

      _, filetodelete2 = post_file(channel_id, "file3.jpg", "5678", 'image/jpeg')
      assert successful?, "Second small file upload is successful."

      assert_assets_custom_metric 2, 'QuotaCrossedHalfUsed'
      assert_assets_custom_event 1, 'QuotaCrossedHalfUsed'

      post_file(channel_id, "file4.jpg", "ABCD", 'image/jpeg')
      assert last_response.client_error?, "Error when exceeding max app size."

      assert_assets_custom_metric 3, 'QuotaExceeded'
      assert_assets_custom_event 2, 'QuotaExceeded'

      delete_object(channel_id, filetodelete1)
      delete_object(channel_id, filetodelete2)

      assert (list_assets(channel_id).empty?), "No unexpected assets were written to storage."
      delete_channel(channel_id)
    end
    FilesApi.any_instance.unstub(:max_file_size)
    FilesApi.any_instance.unstub(:max_app_size)

  end

  def test_asset_last_modified
    channel = create_channel

    file, filename = create_uploaded_file('test.png', 'version 1', 'image/png')

    post channel, file
    get_object channel, filename
    v1_last_modified = last_response.headers['Last-Modified']

    # We can't Timecop here because the last-modified time needs to change on the server.
    sleep 1 if VCR.current_cassette.recording?

    post channel, file
    get_object channel, filename, '', 'HTTP_IF_MODIFIED_SINCE' => v1_last_modified
    assert_equal 200, last_response.status
    v2_last_modified = last_response.headers['Last-Modified']

    get_object channel, filename, '', 'HTTP_IF_MODIFIED_SINCE' => v2_last_modified
    assert_equal 304, last_response.status
  end

  def test_invalid_mime_type_returns_unsupported_media_type
    channel = create_channel

    get_object channel, 'filewithinvalidmimetype.asdasdas%25dasdasd'

    assert_equal 415, last_response.status # 415 = Unsupported media type
  end

  # Methods below this line are test utilities, not actual tests
  private

  def list_assets(channel_id)
    list_objects 'assets', channel_id
  end

  def post_object(channel_id, uploaded_file)
    body = { files: [uploaded_file] }
    post("/v3/assets/#{channel_id}/", body, 'CONTENT_TYPE' => 'multipart/form-data').body
  end

  def patch_abuse(channel_id, abuse_score)
    patch("/v3/assets/#{channel_id}/?abuse_score=#{abuse_score}").body
  end

  def get_object(channel_id, filename, body = '', headers = {})
    get "/v3/assets/#{channel_id}/#{filename}", body, headers
    last_response.body
  end

  def delete_object(channel_id, filename)
    delete "/v3/assets/#{channel_id}/#{filename}"
  end

  def copy_all(src_channel_id, dest_channel_id)
    AssetBucket.new.copy_files(src_channel_id, dest_channel_id).to_json
  end

  def create_uploaded_file(filename, contents, content_type)
    basename = [filename.split('.')[0], '.' + filename.split('.')[1]]
    temp_filename = basename[0] + @random.bytes(10).unpack('H*')[0] + basename[1]
    Dir.mktmpdir do |dir|
      file_path = "#{dir}/#{temp_filename}"
      File.open(file_path, 'w') do |file|
        file.write(contents)
        file.rewind
      end
      [Rack::Test::UploadedFile.new(file_path, content_type), temp_filename]
    end
  end

  def post_file(channel_id, filename, contents, content_type)
    file, tmp_filename = create_uploaded_file(filename, contents, content_type)
    response = post_object(channel_id, file)
    [response, tmp_filename]
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
