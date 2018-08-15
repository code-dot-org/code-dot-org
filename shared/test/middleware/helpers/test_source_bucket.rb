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
    @channel = create_channel
    @main_json = 'main.json' # Source bucket only ever uses this file
  end

  def teardown
    # Require that tests delete the files they upload
    assert_empty SourceBucket.new.list(@channel),
      "Expected no leftover source files"
    assert_empty SourceBucket.new.list_versions(@channel, @main_json),
      "Expected no leftover main.json versions"

    delete_channel(@channel)
    @channel = nil
  end

  def test_hard_delete_channel_content
    sb = SourceBucket.new
    sb.hard_delete_channel_content @channel

    assert_empty sb.list @channel
    assert_empty sb.list_versions @channel, @main_json

    sb.create_or_replace @channel, @main_json, '{}'

    refute_empty sb.list(@channel)
    refute_empty sb.list_versions(@channel, @main_json)

    sb.hard_delete_channel_content @channel

    assert_empty sb.list(@channel)
    assert_empty sb.list_versions(@channel, @main_json)
  end
end
