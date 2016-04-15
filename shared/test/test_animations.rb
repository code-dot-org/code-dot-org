require_relative 'test_helper'
require 'files_api'
require 'channels_api'

class AnimationsTest < MiniTest::Test
  include SetupTest

  def setup
    @random = Random.new(0)
    @channels_api, @files_api = init_apis
    @channel_id = create_channel(@channels_api)
    ensure_aws_credentials
  end

  def teardown
    assert_empty JSON.parse(list_animations) # Require that tests delete the assets they upload
    delete_channel(@channels_api, @channel_id)
    @channel_id = nil
  end

  def test_upload_animations
    dog_image_filename = randomize_filename('dog.png')
    dog_image_body = 'stub-dog-contents'
    cat_image_filename = randomize_filename('cat.png')
    cat_image_body = 'stub-cat-contents'

    # Make sure we have a clean starting point
    delete_all_animation_versions(dog_image_filename)
    delete_all_animation_versions(cat_image_filename)

    # Upload dog.png and check the response
    response = upload(dog_image_filename, dog_image_body, 'image/png')
    actual_dog_image_info = JSON.parse(response)
    expected_dog_image_info = {
      'filename' => dog_image_filename,
      'category' => 'image',
      'size' => dog_image_body.length
    }
    assert_fileinfo_equal(expected_dog_image_info, actual_dog_image_info)

    # Upload cat.png and check the response
    response = upload(cat_image_filename, cat_image_body, 'image/png')
    actual_cat_image_info = JSON.parse(response)
    expected_cat_image_info = {
      'filename' =>  cat_image_filename,
      'category' => 'image',
      'size' => cat_image_body.length
    }
    assert_fileinfo_equal(expected_cat_image_info, actual_cat_image_info)

    file_infos = JSON.parse(list_animations)
    assert_fileinfo_equal(actual_cat_image_info, file_infos[0])
    assert_fileinfo_equal(actual_dog_image_info, file_infos[1])

    get(dog_image_filename)
    assert_equal 'public, max-age=3600, s-maxage=1800', @files_api.last_response['Cache-Control']

    delete(dog_image_filename)
    assert successful?

    delete(cat_image_filename)
    assert successful?
  end

  def test_unsupported_media_type
    upload('executable.exe', 'stub-contents', 'application/x-msdownload')
    assert unsupported_media_type?
  end

  def test_allow_mismatched_mime_type
    mismatched_filename = randomize_filename('mismatchedmimetype.png')
    delete_all_animation_versions(mismatched_filename)

    upload(mismatched_filename, 'stub-contents', 'application/gif')
    assert successful?

    delete(mismatched_filename)
    assert successful?
  end

  def test_extension_case_sensitivity
    filename = randomize_filename('casesensitive.PNG')
    different_case_filename = filename.gsub(/PNG$/, 'png')
    delete_all_animation_versions(filename)
    delete_all_animation_versions(different_case_filename)

    upload(filename, 'stub-contents', 'application/png')
    assert successful?

    get(filename)
    assert successful?

    get(different_case_filename)
    assert not_found?

    delete(filename)
    assert successful?
  end

  def test_nonexistent_animation
      filename = randomize_filename('nonexistent.png')
      delete_all_animation_versions(filename)

      delete(filename) # Not a no-op - creates a delete marker
      assert successful?

      get(filename)
      assert not_found?
  end

  def test_copy_animation
    source_image_filename = randomize_filename('copy_source.png')
    source_image_body = 'stub-source-contents'
    dest_image_filename = randomize_filename('copy_dest.png')

    # Make sure we have a clean starting point
    delete_all_animation_versions(source_image_filename)
    delete_all_animation_versions(dest_image_filename)

    # Upload copy_source.png and check the response
    upload(source_image_filename, source_image_body, 'image/png')
    assert successful?

    # Copy copy_source.png to copy_dest.png
    copy(source_image_filename, dest_image_filename)
    assert successful?, @files_api.last_response.inspect

    # Get copy_dest.png and make sure it's got the source content
    get(dest_image_filename)
    assert_equal source_image_body, get(dest_image_filename)
    assert_equal 'public, max-age=3600, s-maxage=1800', @files_api.last_response['Cache-Control']

    delete(source_image_filename)
    assert successful?

    delete(dest_image_filename)
    assert successful?
  end

  def test_copy_nonexistent_animation
    source_image_filename = randomize_filename('copy_nonexistent_source.png')
    dest_image_filename = randomize_filename('copy_nonexistent_dest.png')

    # Make sure we have a clean starting point
    delete_all_animation_versions(source_image_filename)
    delete_all_animation_versions(dest_image_filename)

    # Try to copy nonexistent source to destination
    copy(source_image_filename, dest_image_filename)
    assert not_found?
  end

  def test_animation_versions
    filename = randomize_filename('test.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    v1_file_data = 'stub-v1-body'
    upload(filename, v1_file_data, 'image/png')
    assert successful?, @files_api.last_response.inspect

    # Overwrite it.
    v2_file_data = 'stub-v2-body'
    upload(filename, v2_file_data, 'image/png')
    assert successful?

    # Delete it.
    delete(filename)
    assert successful?

    # List versions.
    versions = list_versions(filename)
    assert successful?
    assert_equal 2, versions.count

    # Get the first and second version.
    assert_equal v1_file_data, get_version(filename, versions.last['versionId'])
    assert_equal v2_file_data, get_version(filename, versions.first['versionId'])

    # Check cache headers
    assert_equal 'public, max-age=3600, s-maxage=1800', @files_api.last_response['Cache-Control']
  end

  def test_replace_animation_version
    filename = randomize_filename('replaceme.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    v1_file_data = 'stub-v1-body'
    upload(filename, v1_file_data, 'image/png')
    assert successful?
    original_version_id = JSON.parse(@files_api.last_response.body)['versionId']

    # Overwrite it, specifying the same version
    v2_file_data = 'stub-v2-body'
    upload_version(filename, original_version_id, v2_file_data, 'image/png')
    new_version_id = JSON.parse(@files_api.last_response.body)['versionId']
    assert successful?

    # Make sure only one version exists
    versions = list_versions(filename)
    assert successful?
    assert_equal 1, versions.count
    assert_equal new_version_id, versions[0]['versionId']

    # Note that even though we replaced a version, the version ID changed.
    refute_equal original_version_id, new_version_id

    # Make sure that one version has the newest content
    assert_equal v2_file_data, get_version(filename, new_version_id)

    delete(filename)
  end

  private

  # Initialize test sessions for ChannelsApi and FilesApi
  def init_apis
    channels_api = Rack::Test::Session.new(Rack::MockSession.new(ChannelsApi, 'studio.code.org'))

    # Make sure the animations api has the same storage id cookie used by the channels api.
    channels_api.get '/v3/channels'
    cookies = channels_api.last_response.headers['Set-Cookie']
    files_mock_session = Rack::MockSession.new(FilesApi, "studio.code.org")
    files_mock_session.cookie_jar.merge(cookies)
    files_api = Rack::Test::Session.new(files_mock_session)

    [channels_api, files_api]
  end

  def ensure_aws_credentials
    list_animations
    credentials_missing = !@files_api.last_response.successful? &&
        @files_api.last_response.body.index('Aws::Errors::MissingCredentialsError')
    credentials_msg = <<-TEXT.gsub(/^\s+/, '').chomp
      Aws::Errors::MissingCredentialsError: if you are running these tests locally,
      follow these instructions to configure your AWS credentials and try again:
      http://docs.aws.amazon.com/AWSEC2/latest/CommandLineReference/set-up-ec2-cli-linux.html
    TEXT
  rescue Aws::S3::Errors::InvalidAccessKeyId
    credentials_missing = true
    credentials_msg = <<-TEXT.gsub(/^\s+/, '').chomp
      Aws::S3::Errors::InvalidAccessKeyId: Make sure your AWS credentials are set in your locals.yml.
      If you don't have AWS credentials, follow these instructions to configure your AWS credentials and try again:
      http://docs.aws.amazon.com/AWSEC2/latest/CommandLineReference/set-up-ec2-cli-linux.html
    TEXT
  ensure
    flunk credentials_msg if credentials_missing
  end

  def create_channel(channels_api)
    channels_api.post '/v3/channels', {}.to_json, 'CONTENT_TYPE' => 'application/json;charset=utf-8'
    channels_api.last_response.location.split('/').last
  end

  def delete_channel(channels_api, channel_id)
    channels_api.delete "/v3/channels/#{channel_id}"
    assert channels_api.last_response.successful?
  end

  def list_animations
    @files_api.get("/v3/animations/#{@channel_id}").body
  end

  def list_versions(filename)
    response = @files_api.get "/v3/animations/#{@channel_id}/#{filename}/versions"
    JSON.parse(response.body)
  end

  def get(filename, body = '', headers = {})
    @files_api.get "/v3/animations/#{@channel_id}/#{filename}", body, headers
    @files_api.last_response.body
  end

  def get_version(filename, version_id)
    @files_api.get("/v3/animations/#{@channel_id}/#{filename}?version=#{version_id}").body
  end

  def delete(filename)
    @files_api.delete "/v3/animations/#{@channel_id}/#{filename}"
  end

  def upload(filename, contents, content_type)
    upload_version(filename, nil, contents, content_type)
  end

  def upload_version(filename, version_id, contents, content_type)
    url = "/v3/animations/#{@channel_id}/#{filename}"
    query_params = version_id.nil? ? '' : "?version=#{version_id}"

    body = { files: [create_uploaded_file(filename, contents, content_type)] }
    @files_api.post(url + query_params, body, 'CONTENT_TYPE' => content_type)
    @files_api.last_response.body
  end

  def create_uploaded_file(filename, contents, content_type)
    Dir.mktmpdir do |dir|
      file_path = "#{dir}/#{filename}"
      File.open(file_path, 'w') do |file|
        file.write(contents)
        file.rewind
      end
      Rack::Test::UploadedFile.new(file_path, content_type)
    end
  end

  def copy(source_filename, dest_filename)
    @files_api.post("/v3/animations/#{@channel_id}/#{dest_filename}/from/#{source_filename}")
    @files_api.last_response.body
  end

  # Delete all versions of the specified file from S3, including all delete markers
  def delete_all_versions(bucket, key)
    s3 = Aws::S3::Client.new
    response = s3.list_object_versions(bucket: bucket, prefix: key)
    objects = response.versions.concat(response.delete_markers).map do |version|
      {
          key: key,
          version_id: version.version_id
      }
    end
    s3.delete_objects(
        bucket: bucket,
        delete: {
            objects: objects,
            quiet: true
        }
    ) if objects.any?
  end

  def delete_all_animation_versions(filename)
    delete_all_versions(CDO.animations_s3_bucket, "animations_test/1/1/#{filename}")
  end

  def successful?
    @files_api.last_response.successful?
  end

  def not_found?
    @files_api.last_response.not_found?
  end

  def unsupported_media_type?
    @files_api.last_response.status == 415
  end

  def assert_fileinfo_equal(expected, actual)
    assert_equal(Hash, actual.class)
    assert_equal(expected['filename'], actual['filename'])
    assert_equal(expected['category'], actual['category'])
    assert_equal(expected['size'], actual['size'])
  end

  def randomize_filename(filename)
    basename = [filename.split('.')[0], '.' + filename.split('.')[1]]
    basename[0] + '_' + @random.bytes(10).unpack('H*')[0] + basename[1]
  end

end
