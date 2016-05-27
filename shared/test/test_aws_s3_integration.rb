require_relative 'test_helper'
require 'cdo/aws/s3'

class AwsS3IntegrationTest < Minitest::Test
  include SetupTest

  # A test bucket, only used for these tests.
  TEST_BUCKET = 'cdo-temp'

  # An integration test of the AWS S3 wrapper that runs against the actual AWS service.
  def test_aws_s3
    # Test upload_to_bucket and download_from_bucket with :no_random.
    random = Random.new(0)
    test_key = random.rand.to_s
    test_value = 'hello\x00\x01\xFF'
    upload_key = AWS::S3.upload_to_bucket(TEST_BUCKET, test_key, test_value, :no_random => true)
    assert_equal test_value, AWS::S3.download_from_bucket(TEST_BUCKET, test_key)
    assert_equal test_key, upload_key

    # Make sure a string all of possible bytes and make sure it round trips correctly.
    video_key = 'video_key'
    all_bytes = (0..255).to_a.pack('C*')
    AWS::S3.upload_to_bucket(TEST_BUCKET, video_key, all_bytes, :no_random => true, :content_type => 'video/mp4')
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
    assert !allows_public_reads, 'default acl should not allow public reads'
  end

  def test_public_url
    assert_equal "https://cdo-temp.s3.amazonaws.com/a/filename.pdf",  AWS::S3.public_url(TEST_BUCKET, 'a/filename.pdf')
  end

end
