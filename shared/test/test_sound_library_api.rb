require_relative 'test_helper'
require 'sound_library_api'
require_relative 'files_api_test_base'
require 'timecop'

class SoundLibraryTest < FilesApiTestBase
  SOUND_LIBRARY_TEST_KEY = 'test_sound.mp3'.freeze
  RESTRICTED_SOUND_TEST_FILENAME = 'test.mp3'.freeze

  def build_rack_mock_session
    @session = Rack::MockSession.new(SoundLibraryApi, 'studio.code.org')
  end

  def test_get_sound
    content = 'MP3_CONTENT'
    # Ensure the shared S3 client is used by stubbing the client with the expected response.
    AWS::S3.s3 = Aws::S3::Client.new(
      stub_responses: {
        list_object_versions: {
          versions: [{key: 'key', version_id: 'version'}]
        },
        head_object: {delete_marker: false},
        get_object: {body: content}
      }
    )
    get '/api/v1/sound-library/test_sound.mp3'
    assert last_response.ok?
    assert_equal content, last_response.body
  ensure
    AWS::S3.s3 = nil
  end

  def test_get_deleted_sound
    assert_empty SOUND_LIBRARY_BUCKET, SOUND_LIBRARY_TEST_KEY
    content = 'MP3_CONTENT'

    s3 = AWS::S3.create_client
    s3.put_object(
      bucket: SOUND_LIBRARY_BUCKET,
      key: SOUND_LIBRARY_TEST_KEY,
      body: content,
      content_type: 'audio/mp3'
    )
    s3.delete_object(
      bucket: SOUND_LIBRARY_BUCKET,
      key: SOUND_LIBRARY_TEST_KEY,
    )

    get "/api/v1/sound-library/#{SOUND_LIBRARY_TEST_KEY}"
    assert last_response.ok?
    assert_equal content, last_response.body
  ensure
    delete_all_versions(SOUND_LIBRARY_BUCKET, SOUND_LIBRARY_TEST_KEY, 10)
  end

  def test_get_restricted_sound
    s3_key = "restricted/#{RESTRICTED_SOUND_TEST_FILENAME}"
    content = 'RESTRICTED_CONTENT'

    s3 = AWS::S3.create_client
    s3.put_object(
      bucket: RESTRICTED_BUCKET,
      key: s3_key,
      body: content,
      content_type: 'audio/mp3'
    )

    url = "/restricted/#{RESTRICTED_SOUND_TEST_FILENAME}"

    # no cloudfront policy
    CDO.stub(:rack_env, :development) do
      get url
      assert last_response.client_error?
    end

    Timecop.freeze
    expires = Time.now + 1
    @session.set_cookie("CloudFront-Policy=#{stub_policy(expires)}")

    # cloudfront policy is current
    CDO.stub(:rack_env, :development) do
      get url
      assert last_response.ok?
      assert_equal content, last_response.body
    end

    # production raises even with current policy
    CDO.stub(:rack_env, :production) do
      assert_raises do
        get url
      end
    end

    # policy has expired
    Timecop.travel 2
    CDO.stub(:rack_env, :development) do
      get url
      assert last_response.client_error?
    end

    s3.delete_object(
      bucket: RESTRICTED_BUCKET,
      key: s3_key,
    )

    Timecop.return
  end

  # Ensure no versions of the specified object currently exist.
  def assert_empty(bucket, key)
    response = AWS::S3.create_client.
      list_object_versions(bucket: bucket, prefix: key)
    versions = response.versions.concat(response.delete_markers)
    assert versions.empty?, "s3://#{bucket}/#{key} is not empty."
  end

  # Return a stub cloudfront signed cookie policy with only the expiration date
  # set. For details, see:
  # https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-setting-signed-cookie-custom-policy.html
  # @param [Time] expires Time at which this policy expires.
  def stub_policy(expires)
    policy_json = {
      'Statement' => [
        'Condition' => {
          'DateLessThan' => {'AWS:EpochTime' => expires.tv_sec}
        }
      ]
    }.to_json
    Base64.strict_encode64(policy_json).tr('+=/', '-_~')
  end
end
