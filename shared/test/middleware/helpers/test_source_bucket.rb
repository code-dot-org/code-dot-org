require_relative '../../files_api_test_base' # Must be required first to establish load paths
require_relative '../../files_api_test_helper'

#
# Unlike SourcesTest (test_sources.rb) which is essentially a controller test
# designed to full exercise the public API, this is meant to be more like a
# unit test for SourceBucket (source_bucket.rb).
#
# However, we're using the FilesAPITestBase because some of the setup and
# teardown is easier to do through our actual API, and we want to use VCR
# to actually test S3 operations.
#
class SourceBucketTest < FilesApiTestBase
  def setup
    @source_bucket = SourceBucket.new
    @channel = create_channel
    @main_json = 'main.json' # Source bucket only ever uses this file

    # Start with an empty channel
    @source_bucket.hard_delete_channel_content @channel
    assert_empty @source_bucket.list @channel
    assert_empty @source_bucket.list_versions @channel, @main_json
  end

  def teardown
    # Require that tests delete the files they upload
    assert_empty @source_bucket.list(@channel),
      "Expected no leftover source files"
    assert_empty @source_bucket.list_versions(@channel, @main_json),
      "Expected no leftover main.json versions"

    delete_channel(@channel)
    @channel = nil
    @source_bucket = nil
  end

  def test_hard_delete_channel_content
    @source_bucket.create_or_replace @channel, @main_json, '{}'

    refute_empty @source_bucket.list(@channel)
    refute_empty @source_bucket.list_versions(@channel, @main_json)

    @source_bucket.hard_delete_channel_content @channel

    assert_empty @source_bucket.list(@channel)
    assert_empty @source_bucket.list_versions(@channel, @main_json)
  end

  def test_hard_delete_channel_content_many_versions
    @source_bucket.create_or_replace @channel, @main_json, '{"name": "v1"}'
    @source_bucket.create_or_replace @channel, @main_json, '{"name": "v2"}'
    @source_bucket.create_or_replace @channel, @main_json, '{"name": "v3"}'

    assert_equal 3, @source_bucket.list_versions(@channel, @main_json).count

    @source_bucket.hard_delete_channel_content @channel

    assert_empty @source_bucket.list_versions(@channel, @main_json)
  end

  def test_hard_delete_channel_content_delete_markers
    @source_bucket.create_or_replace @channel, @main_json, '{"name": "v1"}'
    @source_bucket.delete @channel, @main_json
    @source_bucket.create_or_replace @channel, @main_json, '{"name": "v2"}'
    @source_bucket.delete @channel, @main_json

    assert_equal 2, @source_bucket.list_delete_markers(@channel, @main_json).count

    @source_bucket.hard_delete_channel_content @channel

    assert_empty @source_bucket.list_delete_markers(@channel, @main_json)
  end
end
