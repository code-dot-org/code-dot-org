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

  def test_get_console_link_from_presigned_rejects_unexpected_input
    assert_raises(ArgumentError) {AWS::S3.get_console_link_from_presigned("")}
    assert_raises(ArgumentError) {AWS::S3.get_console_link_from_presigned("https://example.com//test/20230222T200104%2B0000")}
    assert_raises(ArgumentError) {AWS::S3.get_console_link_from_presigned("https://some-bucket.s3.amazonaws.com")}
  end

  def test_get_console_link_from_presigned_returns_transformed_url
    presigned_url = "https://cdo-build-logs.s3.amazonaws.com/test/20230222T200104%2B0000?versionId=AjeSMS0Eq2pkvljW7ohD2J6qMFMx_ykU&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAW5P5EEELIETSUTKS%2F20230222%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20230222T204400Z&X-Amz-Expires=259200&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEQaCXVzLWVhc3QtMSJGMEQCICuSp6dZ0WJeZ3K%2FEoM7yuEO32NgaByJP%2BiD05%2F%2BK2z%2FAiAOMioA0x2aO7J9gori13wBPCRjNn2QBWVFTOjHEgzfZSrWBAjd%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDQ3NTY2MTYwNzE5MCIMvVTdvqm2IsQmRZrpKqoEPcSC8vnFXU7DtHoHQZ3vDD83MgR1biwz9QvHEbZS3H1fia2%2FZfLPXELz%2BxVWO23NViPn%2B7XV2%2FKbZNdIFAiMvvuzpfdF2R31%2FmgfXcZP6W2NwUUNqrszxgtxM12V3%2BK%2BkBzcoDQshQPXtPeAKdP1EQuDNwL43oLrFrLZ6xK2n85TxGog5F6f0ZEN2IXZRASVtT41nN0GRWgVnhWqlJJWYigtS8eKN7S56cRI5x2264HKTuoHqb2%2BugTInqvM3sKScpRMcEoxbYe98CFa9N11s%2B8LWYxpkVAk2Qb8jEJ6fbN9FIaPK2FmhDdpsljHKfnl15i8wReuRL3v4ajZtok%2BjIkjtZIDNP6MTpEXm%2BwemjNmJzdpLAlYwud%2FUdClHL95GkBe%2FMyZKlicrjRwiSIPJnHSBBJpgSn9p%2FPWvBZgAs7H3C54lfKGLT5TiIodRgn1XrZg83EXmiMomxHloS9s38mVr5QhdyR742xZcfQQ%2BVMcEVxVntVz7xQdwCeWSL1ZV41s9b2fk9HpE9lTPjHvpxtTSoPTGOW8%2Bv2Yees7%2F%2FMyqrmuvY%2Fy0V%2FGE7NRDA5OXdEPXAm6QUmPWNyG%2BKVzE0FnonkpxfLK4KDCd7jcOZSDd3%2BBa%2Fy3%2F9qnppbuvXU3usv4m9vltmw8GDuHv5T3QivksxkuiVjjJ51qgfdEEOIn6o0jRDjhKo12w7Ce4zATW%2BeLR10hZlWZTomGvoYvLWiUCsWnubTO%2BfgwpeTZnwY6qgFp9%2F6%2B%2BVA%2F4dRfQyn%2FqmH%2BJzwYDj4SzTeTVdJ%2FN8FtRj%2BHBet09EBX7zgdBmmebRnSkqOWm0NuXf9cb9aSBAkclmluSP%2Bmk0by%2BJrYvVJSV6Iwv6yCG2de15XbkfQm46eb3c8EqJpI4CGTfyTwrZB7LednvfTVJrpW9iPcI97LmfIez7MlV1nMBANHRdxOiIm4jrwUkryN7EfBC4y9%2BsOQH5zXFlIiZ8vh%2BA%3D%3D&X-Amz-SignedHeaders=host&X-Amz-Signature=3117b23c8bda56230d2dc8c3fd3452b5b5576a2507dcd881fe40ec3bcd77ce70"
    expected_url = "https://s3.console.aws.amazon.com/s3/object/cdo-build-logs?prefix=test/20230222T200104%2B0000"
    assert_equal(expected_url, AWS::S3.get_console_link_from_presigned(presigned_url))
  end
end
