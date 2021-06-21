require_relative 'test_helper'
require 'cdo/aws/s3'
require 'timecop'

class AwsS3IntegrationTest < Minitest::Test
  include SetupTest

  def setup
    AWS::S3.create_client
    Aws::S3::Client.expects(:new).never
  end

  # A test bucket, only used for these tests.
  TEST_BUCKET = 'cdo-temp'.freeze

  # An integration test of the AWS S3 wrapper that runs against the actual AWS service.
  def test_aws_s3
    # Test upload_to_bucket and download_from_bucket with :no_random.
    random = Random.new(0)
    test_key = random.rand.to_s
    test_value = 'hello\x00\x01\xFF'
    upload_key = AWS::S3.upload_to_bucket(TEST_BUCKET, test_key, test_value, no_random: true)
    assert_equal test_value, AWS::S3.download_from_bucket(TEST_BUCKET, test_key)
    assert_equal test_key, upload_key

    # Make sure a string all of possible bytes and make sure it round trips correctly.
    video_key = 'video_key'
    all_bytes = (0..255).to_a.pack('C*')
    AWS::S3.upload_to_bucket(TEST_BUCKET, video_key, all_bytes, no_random: true, content_type: 'video/mp4')
    value = AWS::S3.download_from_bucket(TEST_BUCKET, video_key)
    assert_equal all_bytes, value
    assert_equal Encoding::BINARY, value.encoding
    assert_equal 256, value.bytesize
    bytes = value.codepoints
    (0..255).each do |i|
      assert_equal i, bytes[i]
    end

    # Test upload_to_bucket and download_from_bucket with key randomization.
    key = 'key'
    test_value2 = random.rand.to_s
    randomized_key = AWS::S3.upload_to_bucket(TEST_BUCKET, key, test_value2)
    assert randomized_key.end_with? key
    assert randomized_key.length > key.length
    assert_equal test_value2, AWS::S3.download_from_bucket(TEST_BUCKET, randomized_key)

    test_value3 = random.rand.to_s
    randomized_key2 = AWS::S3.upload_to_bucket(TEST_BUCKET, key, test_value3)
    assert randomized_key2 != randomized_key
    assert_equal test_value3, AWS::S3.download_from_bucket(TEST_BUCKET, randomized_key2)

    # Test that it throws a NoSuchKey exception for a non-existent key
    assert_raises(AWS::S3::NoSuchKey) do
      AWS::S3.download_from_bucket(TEST_BUCKET, 'nonexistent_key')
    end

    # Test connect_v2!
    client = AWS::S3.connect_v2!

    # Make sure the V2 API sees the correct body and content type.
    object = client.get_object(bucket: TEST_BUCKET, key: video_key)
    assert_equal all_bytes, object.body.read.force_encoding(Encoding::BINARY)
    assert_equal 'video/mp4', object.content_type
  end

  def test_s3_presigned_url_upload
    random = Random.new(0)
    key = "presigned_test_key-#{random.rand}"

    # VCR records the particular signed URL's response in the Net::HTTP call below,
    # so we force generation of the same URL each time
    forced_url = "http://cdo-temp.s3.amazonaws.com/presigned_test_key-0.5488135039273248?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJKADNJLDLSFUAK2Q/20180928/us-east-1/s3/aws4_request&X-Amz-Date=20180928T074343Z&X-Amz-Expires=900&X-Amz-Signature=42bda69aface60ce44de2392261f5a7a1d838efac84a1531533cc969acee6a41&X-Amz-SignedHeaders=host"
    Aws::S3::Presigner.any_instance.stubs(:presigned_url).returns(forced_url)

    presigned_url = AWS::S3.presigned_upload_url(TEST_BUCKET, key)
    parsed_url = URI.parse(presigned_url)
    body = 'Testing S3 presigned upload'
    Net::HTTP.start(parsed_url.host) do |http|
      http.send_request("PUT", parsed_url.request_uri, body, {"content-type": ""})
    end

    downloaded = AWS::S3.download_from_bucket(TEST_BUCKET, key)
    assert_equal body, downloaded
  end

  def test_s3_presigned_url_delete
    random = Random.new(0)
    key = 'test-delete-key'
    test_value = random.rand.to_s
    VCR.use_cassette('awss3integration/s3_presigned_url_delete-create') do
      AWS::S3.upload_to_bucket(TEST_BUCKET, key, test_value, no_random: true)
    end

    forced_url = "https://cdo-temp.s3.amazonaws.com/test-delete-key?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJKADNJLDLSFUAK2Q%2F20180929%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20180929T003520Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=a4b2c58fe84adf4f4ac42087bb4bac1bc410814040c93ba4b24b58a322e7a6e6"
    Aws::S3::Presigner.any_instance.stubs(:presigned_url).returns(forced_url)

    VCR.use_cassette('awss3integration/s3_presigned_url_delete-get_present') do
      downloaded = AWS::S3.download_from_bucket(TEST_BUCKET, key)
      assert_equal test_value, downloaded
    end

    presigned_url = AWS::S3.presigned_delete_url(TEST_BUCKET, key)
    parsed_url = URI.parse(presigned_url)
    Net::HTTP.start(parsed_url.host) do |http|
      http.send_request("DELETE", parsed_url.request_uri)
    end

    VCR.use_cassette('awss3integration/s3_presigned_url_delete-get_deleted') do
      refute AWS::S3.exists_in_bucket(TEST_BUCKET, key)
    end
  end

  def test_aws_s3_acl_options
    client = AWS::S3.connect_v2!
    all_users_uri = 'http://acs.amazonaws.com/groups/global/AllUsers'

    # Verify that the public-read acl option creates a publicly readable object.
    public_key = AWS::S3.upload_to_bucket(TEST_BUCKET, 'public_key', 'hello', acl: 'public-read')
    public_grants = client.get_object_acl(bucket: TEST_BUCKET, key: public_key).grants
    allows_public_reads = public_grants.detect do |grant|
      grant.grantee.uri == all_users_uri && grant.permission == 'READ'
    end
    assert allows_public_reads, 'public-read acl should allow public reads'

    # Verify that the default option creates a private object.
    private_key = AWS::S3.upload_to_bucket(TEST_BUCKET, 'private_key', 'hello')
    private_grants = client.get_object_acl(bucket: TEST_BUCKET, key: private_key).grants
    allows_public_reads = private_grants.detect do |grant|
      grant.grantee.uri == all_users_uri && grant.permission == 'READ'
    end
    refute allows_public_reads, 'default acl should not allow public reads'
  end

  def test_public_url
    assert_equal "https://cdo-temp.s3.amazonaws.com/a/filename.pdf",  AWS::S3.public_url(TEST_BUCKET, 'a/filename.pdf')
  end

  def test_s3_timeout
    client = AWS::S3.connect_v2!
    # Use default timeout settings by default.
    assert_equal 60, client.config.http_read_timeout

    DCDO.set('s3_timeout', 1)
    # Slight limitation: change isn't applied until #connect_v2! is called.
    assert_equal 60, client.config.http_read_timeout
    assert_equal 1, AWS::S3.connect_v2!.config.http_read_timeout
    # Existing client references are updated.
    assert_equal 1, client.config.http_read_timeout

    DCDO.set('s3_timeout', nil)
    AWS::S3.connect_v2!
    # Slight limitation: doesn't revert to default setting (60) if variable is set to nil.
    assert_equal 15, client.config.http_read_timeout

    assert_equal 15, client.config.notify_timeout
    DCDO.set('s3_slow_request', 30)
    AWS::S3.connect_v2!
    assert_equal 30, client.config.notify_timeout
    assert_equal 15, client.config.http_read_timeout
    DCDO.set('s3_slow_request', nil)
  end

  # Ensure find objects with ext correctly finds and filters responses
  def test_find_objects_with_ext
    VCR.use_cassette('awss3integration/s3_find_objects_with_ext') do
      test_key_1 = AWS::S3.upload_to_bucket(TEST_BUCKET, 'find_objects/1.test', 'hello', no_random: true)
      test_key_2 = AWS::S3.upload_to_bucket(TEST_BUCKET, 'find_objects/2.test', 'world', no_random: true)
      test_key_3 = AWS::S3.upload_to_bucket(TEST_BUCKET, 'find_objects/3.bad', 'third value', no_random: true)
      results = AWS::S3.find_objects_with_ext(TEST_BUCKET, 'test', 'find_objects')
      assert_equal 2, results.length
      assert results.include?(test_key_1), 'find_objects should find the first file'
      assert results.include?(test_key_2), 'find_objects should find the second file'
      refute results.include?(test_key_3), 'find_objects should not find the third file'
    end
  end

  # Simulate a slow AWS client response.
  class SlowResponder < Seahorse::Client::Plugin
    class Handler < Seahorse::Client::Handler
      def call(context)
        Timecop.travel(context.config.notify_timeout * 2)
        @handler.call(context)
      end
    end
    handler(Handler)
  end

  # Ensures a slow s3 request triggers a Honeybadger notification.
  def test_s3_timeout_notify
    Aws::S3::Client.add_plugin(SlowResponder)
    Aws::S3::Client.unstub(:new)
    AWS::S3.s3 = nil
    Honeybadger.expects(:notify).once
    client = AWS::S3.connect_v2!
    client.head_bucket(bucket: TEST_BUCKET)
  ensure
    Aws::S3::Client.remove_plugin(SlowResponder)
    AWS::S3.s3 = nil
    Timecop.return
  end
end
