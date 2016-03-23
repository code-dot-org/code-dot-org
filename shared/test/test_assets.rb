require 'mocha/mini_test'
require_relative 'test_helper'

require 'files_api'
require 'channels_api'
require 'helpers/asset_bucket'
require_relative 'spy_newrelic_agent'

class AssetsTest < Minitest::Test
  include SetupTest

  def setup
    @channels, @assets = init_apis
    # Ensure the s3 path starts empty.
    delete_all_objects('cdo-v3-assets', 'assets_test/1/1')
    @random = Random.new(0)
  end

  # Delete all objects in the specified path from S3.
  def delete_all_objects(bucket, prefix)
    raise "Not a test path: #{prefix}" unless prefix.include?('test')
    s3 = Aws::S3::Client.new
    objects = s3.list_objects(bucket: bucket, prefix: prefix).contents.map do |object|
      { key: object.key }
    end
    s3.delete_objects(
      bucket: bucket,
      delete: {
        objects: objects,
        quiet: true
      }
    ) if objects.any?
  end

  def test_assets
    channel_id = create_channel(@channels)

    ensure_aws_credentials(channel_id)

    image_body = 'stub-image-contents'
    response, image_filename = post_file(@assets, channel_id, 'dog.jpg', image_body, 'image/jpeg')

    actual_image_info = JSON.parse(response)
    expected_image_info = {'filename' => image_filename, 'category' => 'image', 'size' => image_body.length}
    assert_fileinfo_equal(expected_image_info, actual_image_info)

    sound_body = 'stub-sound-contents'
    response, sound_filename = post_file(@assets, channel_id, 'woof.mp3', sound_body, 'audio/mpeg')

    actual_sound_info = JSON.parse(response)
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}
    assert_fileinfo_equal(expected_sound_info, actual_sound_info)

    file_infos = JSON.parse(list(@assets, channel_id))
    assert_fileinfo_equal(actual_image_info, file_infos[0])
    assert_fileinfo_equal(actual_sound_info, file_infos[1])

    get(@assets, channel_id, image_filename)
    assert_equal 'public, max-age=3600, s-maxage=1800', @assets.last_response['Cache-Control']

    delete(@assets, channel_id, image_filename)
    assert @assets.last_response.successful?

    delete(@assets, channel_id, sound_filename)
    assert @assets.last_response.successful?

    # unsupported media type
    post_file(@assets, channel_id, 'filename.exe', 'stub-contents', 'application/x-msdownload')
    assert_equal 415, @assets.last_response.status

    # mismatched file extension and mime type
    _, mismatched_filename = post_file(@assets, channel_id, 'filename.jpg', 'stub-contents', 'application/gif')
    assert @assets.last_response.successful?
    delete(@assets, channel_id, mismatched_filename)
    assert @assets.last_response.successful?

    # file extension case insensitivity
    _, filename = post_file(@assets, channel_id, 'filename.JPG', 'stub-contents', 'application/jpeg')
    assert @assets.last_response.successful?
    get(@assets, channel_id, filename)
    assert @assets.last_response.successful?
    get(@assets, channel_id, filename.gsub(/JPG$/, 'jpg'))
    assert @assets.last_response.not_found?
    delete(@assets, channel_id, filename)
    assert @assets.last_response.successful?

    # invalid files are not uploaded, and other added files were deleted
    file_infos = JSON.parse(list(@assets, channel_id))
    assert_equal 0, file_infos.length

    delete(@assets, channel_id, 'nonexistent.jpg')
    assert @assets.last_response.successful?

    get(@assets, channel_id, 'nonexistent.jpg')
    assert @assets.last_response.not_found?

    delete_channel(@channels, channel_id)
  end

  def test_set_abuse_score
    channel_id = create_channel(@channels)
    asset_bucket = AssetBucket.new

    # create a couple assets without an abuse score
    _, first_asset = post_file(@assets, channel_id, 'asset1.jpg', 'stub-image-contents', 'image/jpeg')
    _, second_asset = post_file(@assets, channel_id, 'asset2.jpg', 'stub-image-contents', 'image/jpeg')

    result = get(@assets, channel_id, first_asset)
    assert_equal 'stub-image-contents', result

    assert_equal 0, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 0, asset_bucket.get_abuse_score(channel_id, second_asset)

    # set abuse score
    patch_abuse(@assets, channel_id, 10)
    assert_equal 10, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 10, asset_bucket.get_abuse_score(channel_id, second_asset)

    # make sure we didnt blow away contents
    result = get(@assets, channel_id, first_asset)
    assert_equal 'stub-image-contents', result

    # increment
    patch_abuse(@assets, channel_id, 20)
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, second_asset)

    # set to be the same
    patch_abuse(@assets, channel_id, 20)
    assert @assets.last_response.successful?
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, second_asset)

    # non-admin can't decrement
    patch_abuse(@assets, channel_id, 0)
    refute @assets.last_response.successful?
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 20, asset_bucket.get_abuse_score(channel_id, second_asset)

    # admin can decrement
    FilesApi.any_instance.stubs(:admin?).returns(true)
    patch_abuse(@assets, channel_id, 0)
    assert @assets.last_response.successful?
    assert_equal 0, asset_bucket.get_abuse_score(channel_id, first_asset)
    assert_equal 0, asset_bucket.get_abuse_score(channel_id, second_asset)

    # make sure we didnt blow away contents
    result = get(@assets, channel_id, first_asset)
    assert_equal 'stub-image-contents', result
    FilesApi.any_instance.unstub(:admin?)

    delete(@assets, channel_id, first_asset)
    delete(@assets, channel_id, second_asset)
    delete_channel(@channels, channel_id)
  end

  def test_viewing_abusive_assets
    _, non_owner_assets = init_apis
    channel_id = create_channel(@channels)

    _, asset_name = post_file(@assets, channel_id, 'abusive_asset.jpg', 'stub-image-contents', 'image/jpeg')

    # owner can view
    get(@assets, channel_id, asset_name)
    assert @assets.last_response.successful?

    # non-owner can view
    get(non_owner_assets, channel_id, asset_name)
    assert non_owner_assets.last_response.successful?

    # set abuse
    patch_abuse(@assets, channel_id, 10)

    # owner can view
    get(@assets, channel_id, asset_name)
    assert @assets.last_response.successful?

    # non-owner cannot view
    get(non_owner_assets, channel_id, asset_name)
    refute non_owner_assets.last_response.successful?

    # admin can view
    FilesApi.any_instance.stubs(:admin?).returns(true)
    get(@assets, channel_id, asset_name)
    assert @assets.last_response.successful?
    FilesApi.any_instance.unstub(:admin?)

    # teacher can view
    FilesApi.any_instance.stubs(:teaches_student?).returns(true)
    get(non_owner_assets, channel_id, asset_name)
    assert non_owner_assets.last_response.successful?
    FilesApi.any_instance.unstub(:teaches_student?)

    delete(@assets, channel_id, asset_name)
    delete_channel(@channels, channel_id)
  end

  def test_assets_copy_all
    # This test creates 2 channels
    delete_all_objects('cdo-v3-assets', 'assets_test/1/2')
    src_channel_id = create_channel(@channels)
    dest_channel_id = create_channel(@channels)

    image_filename = 'çat.jpg'
    image_body = 'stub-image-contents'

    sound_filename = 'woof.mp3'
    sound_body = 'stub-sound-contents'

    _, image_filename = post_file(@assets, src_channel_id, image_filename, image_body, 'image/jpeg')
    _, sound_filename = post_file(@assets, src_channel_id, sound_filename, sound_body, 'audio/mpeg')
    patch_abuse(@assets, src_channel_id, 10)

    expected_image_info = {'filename' =>  image_filename, 'category' =>  'image', 'size' =>  image_body.length}
    expected_sound_info = {'filename' =>  sound_filename, 'category' => 'audio', 'size' => sound_body.length}

    copy_file_infos = JSON.parse(copy_all(src_channel_id, dest_channel_id))
    dest_file_infos = JSON.parse(list(@assets, dest_channel_id))

    assert_fileinfo_equal(expected_image_info, copy_file_infos[1])
    assert_fileinfo_equal(expected_sound_info, copy_file_infos[0])
    assert_fileinfo_equal(expected_image_info, dest_file_infos[1])
    assert_fileinfo_equal(expected_sound_info, dest_file_infos[0])

    # abuse score didn't carry over
    assert_equal 0, AssetBucket.new.get_abuse_score(dest_channel_id, image_filename)
    assert_equal 0, AssetBucket.new.get_abuse_score(dest_channel_id, sound_filename)

    delete(@assets, src_channel_id, URI.encode(image_filename))
    delete(@assets, src_channel_id, sound_filename)
    delete(@assets, dest_channel_id, URI.encode(image_filename))
    delete(@assets, dest_channel_id, sound_filename)
    delete_channel(@channels, src_channel_id)
    delete_channel(@channels, dest_channel_id)
  end

  def test_assets_auth
    owner_channel_id = create_channel(@channels)

    _, non_owner_assets = init_apis

    basename = 'dog.jpg'
    body = 'stub-image-contents'
    content_type = 'image/jpeg'

    # post_file create a new file/temp filename, so we post twice using the same file here instead
    file, filename = create_uploaded_file(basename, body, content_type)

    post(@assets, owner_channel_id, file)
    assert @assets.last_response.successful?, 'Owner can add a file'

    get(non_owner_assets, owner_channel_id, filename)
    assert non_owner_assets.last_response.successful?, 'Non-owner can read a file'

    post(non_owner_assets, owner_channel_id, file)
    assert non_owner_assets.last_response.client_error?, 'Non-owner cannot write a file'

    delete(non_owner_assets, owner_channel_id, filename)
    refute non_owner_assets.last_response.successful?, 'Non-owner cannot delete a file'

    # other_channel_id isn't owned by either user of the assets API.
    other_channels = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))
    other_channel_id = create_channel(other_channels)

    delete(@assets, owner_channel_id, filename)

    delete_channel(other_channels, other_channel_id)
  end

  def test_assets_quota
    FilesApi.any_instance.stubs(:max_file_size).returns(5)
    FilesApi.any_instance.stubs(:max_app_size).returns(10)
    channel_id = create_channel(@channels)

    post_file(@assets, channel_id, "file1.jpg", "1234567890ABC", 'image/jpeg')
    assert @assets.last_response.client_error?, "Error when file is larger than max file size."

    _, added_filename1 = post_file(@assets, channel_id, "file2.jpg", "1234", 'image/jpeg')
    assert @assets.last_response.successful?, "First small file upload is successful."

    _, added_filename2 = post_file(@assets, channel_id, "file3.jpg", "5678", 'image/jpeg')
    assert @assets.last_response.successful?, "Second small file upload is successful."

    post_file(@assets, channel_id, "file4.jpg", "ABCD", 'image/jpeg')
    assert @assets.last_response.client_error?, "Error when exceeding max app size."

    delete(@assets, channel_id, added_filename1)
    delete(@assets, channel_id, added_filename2)

    assert (JSON.parse(list(@assets, channel_id)).empty?), "No unexpected assets were written to storage."

    delete_channel(@channels, channel_id)
    FilesApi.any_instance.unstub(:max_file_size)
    FilesApi.any_instance.unstub(:max_app_size)
  end

  def test_assets_quota_newrelic_logging
    FilesApi.any_instance.stubs(:max_file_size).returns(5)
    FilesApi.any_instance.stubs(:max_app_size).returns(10)
    CDO.stub(:newrelic_logging, true) do
      channel_id = create_channel(@channels)

      post_file(@assets, channel_id, "file1.jpg", "1234567890ABC", 'image/jpeg')
      assert @assets.last_response.client_error?, "Error when file is larger than max file size."

      assert_assets_custom_metric 1, 'FileTooLarge'

      _, filetodelete1 = post_file(@assets, channel_id, "file2.jpg", "1234", 'image/jpeg')
      assert @assets.last_response.successful?, "First small file upload is successful."

      assert_assets_custom_metric 1, 'FileTooLarge', 'still only one custom metric recorded'

      _, filetodelete2 = post_file(@assets, channel_id, "file3.jpg", "5678", 'image/jpeg')
      assert @assets.last_response.successful?, "Second small file upload is successful."

      assert_assets_custom_metric 2, 'QuotaCrossedHalfUsed'
      assert_assets_custom_event 1, 'QuotaCrossedHalfUsed'

      post_file(@assets, channel_id, "file4.jpg", "ABCD", 'image/jpeg')
      assert @assets.last_response.client_error?, "Error when exceeding max app size."

      assert_assets_custom_metric 3, 'QuotaExceeded'
      assert_assets_custom_event 2, 'QuotaExceeded'

      delete(@assets, channel_id, filetodelete1)
      delete(@assets, channel_id, filetodelete2)

      assert (JSON.parse(list(@assets, channel_id)).empty?), "No unexpected assets were written to storage."
      delete_channel(@channels, channel_id)
    end
    FilesApi.any_instance.unstub(:max_file_size)
    FilesApi.any_instance.unstub(:max_app_size)

  end

  def test_asset_last_modified
    channel = create_channel(@channels)

    file, filename = create_uploaded_file('test.png', 'version 1', 'image/png')

    post @assets, channel, file
    get @assets, channel, filename
    v1_last_modified = @assets.last_response.headers['Last-Modified']

    # We can't Timecop here because the last-modified time needs to change on the server.
    sleep 1 if VCR.current_cassette.recording?

    post @assets, channel, file
    get @assets, channel, filename, '', 'HTTP_IF_MODIFIED_SINCE' => v1_last_modified
    assert_equal 200, @assets.last_response.status
    v2_last_modified = @assets.last_response.headers['Last-Modified']

    get @assets, channel, filename, '', 'HTTP_IF_MODIFIED_SINCE' => v2_last_modified
    assert_equal 304, @assets.last_response.status
  end

  def test_invalid_mime_type_returns_unsupported_media_type
    channel = create_channel(@channels)

    get @assets, channel, 'filewithinvalidmimetype.asdasdas%25dasdasd'

    assert_equal 415, @assets.last_response.status # 415 = Unsupported media type
  end

  # Methods below this line are test utilities, not actual tests
  private

  def init_apis
    channels ||= Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, "studio.code.org"))

    # Make sure the assets api has the same storage id cookie used by the channels api.
    channels.get '/v3/channels'
    cookies = channels.last_response.headers['Set-Cookie']
    assets_mock_session = Rack::MockSession.new(FilesApi, "studio.code.org")
    assets_mock_session.cookie_jar.merge(cookies)
    assets ||= Rack::Test::Session.new(assets_mock_session)

    [channels, assets]
  end

  def create_channel(channels)
    channels.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channels.last_response.location.split('/').last
  end

  def delete_channel(channels, channel_id)
    channels.delete "/v3/channels/#{channel_id}"
    assert channels.last_response.successful?
  end

  def ensure_aws_credentials(channel_id)
    list(@assets, channel_id)
    credentials_missing = !@assets.last_response.successful? &&
      @assets.last_response.body.index('Aws::Errors::MissingCredentialsError')
    credentials_msg = <<-TEXT.gsub(/^\s+/, '').chomp
      Aws::Errors::MissingCredentialsError: if you are running these tests locally,
      follow these instructions to configure your AWS credentials and try again:
      http://docs.aws.amazon.com/AWSEC2/latest/CommandLineReference/set-up-ec2-cli-linux.html
    TEXT
    flunk credentials_msg if credentials_missing
  end

  def list(assets, channel_id)
    assets.get("/v3/assets/#{channel_id}").body
  end

  def put(assets, channel_id, filename, body, content_type)
    assets.put("/v3/assets/#{channel_id}/#{filename}", body, 'CONTENT_TYPE' => content_type).body
  end

  def post(assets, channel_id, uploaded_file)
    body = { files: [uploaded_file] }
    assets.post("/v3/assets/#{channel_id}/", body, 'CONTENT_TYPE' => 'multipart/form-data').body
  end

  def patch_abuse(assets, channel_id, abuse_score)
    assets.patch("/v3/assets/#{channel_id}/?abuse_score=#{abuse_score}").body
  end

  def get(assets, channel_id, filename, body = '', headers = {})
    assets.get "/v3/assets/#{channel_id}/#{filename}", body, headers
    assets.last_response.body
  end

  def delete(assets, channel_id, filename)
    assets.delete "/v3/assets/#{channel_id}/#{filename}"
  end

  def copy_all(src_channel_id, dest_channel_id)
    AssetBucket.new.copy_files(src_channel_id, dest_channel_id).to_json
  end

  def assert_fileinfo_equal(expected, actual)
    assert_equal(Hash, actual.class)
    assert_equal(expected['filename'], actual['filename'])
    assert_equal(expected['category'], actual['category'])
    assert_equal(expected['size'], actual['size'])
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

  def post_file(assets, channel_id, filename, contents, content_type)
    file, tmp_filename = create_uploaded_file(filename, contents, content_type)
    response = post(assets, channel_id, file)
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
