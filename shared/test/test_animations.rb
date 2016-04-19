require_relative 'files_api_test_base'

class AnimationsTest < FilesApiTestBase

  def setup
    @random = Random.new(0)
    @channel_id = create_channel
    ensure_aws_credentials
  end

  def teardown
    assert_empty JSON.parse(list_animations) # Require that tests delete the assets they upload
    delete_channel(@channel_id)
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

    get_object(dog_image_filename)
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    delete_object(dog_image_filename)
    assert successful?

    delete_object(cat_image_filename)
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

    delete_object(mismatched_filename)
    assert successful?
  end

  def test_extension_case_sensitivity
    filename = randomize_filename('casesensitive.PNG')
    different_case_filename = filename.gsub(/PNG$/, 'png')
    delete_all_animation_versions(filename)
    delete_all_animation_versions(different_case_filename)

    upload(filename, 'stub-contents', 'application/png')
    assert successful?

    get_object(filename)
    assert successful?

    get_object(different_case_filename)
    assert not_found?

    delete_object(filename)
    assert successful?
  end

  def test_nonexistent_animation
    filename = randomize_filename('nonexistent.png')
    delete_all_animation_versions(filename)

    delete_object(filename) # Not a no-op - creates a delete marker
    assert successful?

    get_object(filename)
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
    assert successful?

    # Get copy_dest.png and make sure it's got the source content
    get_object(dest_image_filename)
    assert_equal source_image_body, get_object(dest_image_filename)
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    delete_object(source_image_filename)
    assert successful?

    delete_object(dest_image_filename)
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
    assert successful?

    # Overwrite it.
    v2_file_data = 'stub-v2-body'
    upload(filename, v2_file_data, 'image/png')
    assert successful?

    # Delete it.
    delete_object(filename)
    assert successful?

    # List versions.
    versions = list_versions(filename)
    assert successful?
    assert_equal 2, versions.count

    # Get the first and second version.
    assert_equal v1_file_data, get_version(filename, versions.last['versionId'])
    assert_equal v2_file_data, get_version(filename, versions.first['versionId'])

    # Check cache headers
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']
  end

  def test_replace_animation_version
    filename = randomize_filename('replaceme.png')
    delete_all_animation_versions(filename)

    # Create an animation file
    v1_file_data = 'stub-v1-body'
    upload(filename, v1_file_data, 'image/png')
    assert successful?
    original_version_id = JSON.parse(last_response.body)['versionId']

    # Overwrite it, specifying the same version
    v2_file_data = 'stub-v2-body'
    upload_version(filename, original_version_id, v2_file_data, 'image/png')
    new_version_id = JSON.parse(last_response.body)['versionId']
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

    delete_object(filename)
  end

  private

  def ensure_aws_credentials
    list_animations
    credentials_missing = !last_response.successful? &&
        last_response.body.index('Aws::Errors::MissingCredentialsError')
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

  def list_animations
    get "/v3/animations/#{@channel_id}"
    last_response.body
  end

  def list_versions(filename)
    get "/v3/animations/#{@channel_id}/#{filename}/versions"
    JSON.parse(last_response.body)
  end

  def get_object(filename, body = '', headers = {})
    get "/v3/animations/#{@channel_id}/#{filename}", body, headers
    last_response.body
  end

  def get_version(filename, version_id)
    get "/v3/animations/#{@channel_id}/#{filename}?version=#{version_id}"
    last_response.body
  end

  def delete_object(filename)
    delete "/v3/animations/#{@channel_id}/#{filename}"
  end

  def upload(filename, contents, content_type)
    upload_version(filename, nil, contents, content_type)
  end

  def upload_version(filename, version_id, contents, content_type)
    url = "/v3/animations/#{@channel_id}/#{filename}"
    query_params = version_id.nil? ? '' : "?version=#{version_id}"

    body = { files: [create_uploaded_file(filename, contents, content_type)] }
    post url + query_params, body, 'CONTENT_TYPE' => content_type
    last_response.body
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
    put "/v3/animations/#{@channel_id}/#{dest_filename}?src=#{CGI.escape(source_filename)}"
    last_response.body
  end

  def delete_all_animation_versions(filename)
    delete_all_versions(CDO.animations_s3_bucket, "animations_test/1/1/#{filename}")
  end

  def successful?
    last_response.successful?
  end

  def not_found?
    last_response.not_found?
  end

  def unsupported_media_type?
    last_response.status == 415
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
