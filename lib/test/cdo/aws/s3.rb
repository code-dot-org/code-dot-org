require_relative '../../test_helper'

BUCKET = 'test-bucket'

class CdoAwsS3Test < Minitest::Test
  def setup
    AWS::S3.create_client
  end

  def test_cached_exists_in_bucket_caches_list
    # explicitly clear the cache variable before the test, in case antoher
    # test has set it.
    AWS::S3.instance_variable_set(:@cached_bucket_contents, nil)

    # we expect the list operation to be called only once per bucket
    AWS::S3.s3.stubs(:list_objects_v2).returns(
      Aws::S3::Types::ListObjectsV2Output.new(
        contents: [Aws::S3::Types::Object.new(key: "test-object")]
      )
    ).once

    refute AWS::S3.instance_variable_get(:@cached_bucket_contents)
    assert AWS::S3.cached_exists_in_bucket?(BUCKET, 'test-object')
    refute AWS::S3.cached_exists_in_bucket?(BUCKET, 'test-nonexistent')
    assert AWS::S3.instance_variable_get(:@cached_bucket_contents)

    AWS::S3.s3.unstub(:list_objects_v2)
  end

  def test_upload_updates_cache
    AWS::S3.instance_variable_set(:@cached_bucket_contents, {BUCKET => Set.new})
    AWS::S3.s3.stubs(:put_object)

    refute AWS::S3.cached_exists_in_bucket?(BUCKET, 'test-nonexistent')
    AWS::S3.upload_to_bucket(BUCKET, 'test-nonexistent', '', {no_random: true})
    assert AWS::S3.cached_exists_in_bucket?(BUCKET, 'test-nonexistent')

    AWS::S3.s3.unstub(:put_object)
  end

  def test_delete_updates_cache
    AWS::S3.instance_variable_set(:@cached_bucket_contents, {BUCKET => Set['test-object']})
    mock = MiniTest::Mock.new
    def mock.delete_marker
    end
    AWS::S3.s3.stubs(:delete_object).returns(mock)

    assert AWS::S3.cached_exists_in_bucket?(BUCKET, 'test-object')
    AWS::S3.delete_from_bucket(BUCKET, 'test-object')
    refute AWS::S3.cached_exists_in_bucket?(BUCKET, 'test-object')

    AWS::S3.s3.unstub(:delete_object)
  end
end
