require_relative '../../files_api_test_base' # Must be required first to establish load paths
require_relative '../../files_api_test_helper'
require 'ostruct'

#
# Unlike AssetsTest (test_assets.rb) which is essentially a controller test
# designed to full exercise the public API, this is meant to be more like a
# unit test for AssetBucket (asset_bucket.rb).
#
# However, we're using the FilesAPITestBase because some of the setup and
# teardown is easier to do through our actual API, and we want to use VCR
# to actually test S3 operations.
#
# The cdo-v3-assets bucket is unversioned, so some of the operations other
# buckets perform across multiple versions don't apply here.
#
class AssetBucketTest < FilesApiTestBase
  def setup
    @asset_bucket = AssetBucket.new
    @channel = create_channel

    @cat_jpg = 'cat.jpg'
    @dog_jpg = 'dog.jpg'

    # Start with an empty channel
    @asset_bucket.hard_delete_channel_content @channel
    assert_empty @asset_bucket.list @channel
  end

  def teardown
    # Require that tests delete the files they upload
    assert_empty @asset_bucket.list(@channel),
      "Expected no leftover source files"

    delete_channel(@channel)
    @channel = nil
    @asset_bucket = nil
  end

  def test_hard_delete_channel_content
    @asset_bucket.create_or_replace @channel, @cat_jpg, 'fake-image-body'
    @asset_bucket.create_or_replace @channel, @dog_jpg, 'fake-image-body'

    assert_equal 2, @asset_bucket.list(@channel).count

    @asset_bucket.hard_delete_channel_content @channel

    assert_empty @asset_bucket.list(@channel)
  end

  def test_hard_delete_channel_content_noop
    assert_empty @asset_bucket.list(@channel)

    result = @asset_bucket.hard_delete_channel_content @channel
    assert_equal 0, result
  end

  def test_raises_on_s3_error
    fake_object_versions_response = OpenStruct.new(
      {
        versions: [
          {key: 'fake-key', version_id: 'null'}
        ],
        delete_markers: []
      }
    )

    fake_delete_objects_response = OpenStruct.new(
      {
        deleted: [],
        errors: [
          {key: 'fake-key', version_id: 'null', code: '500', message: 'Fake failure'}
        ]
      }
    )

    @asset_bucket.s3.stub :list_object_versions, fake_object_versions_response do
      @asset_bucket.s3.stub :delete_objects, fake_delete_objects_response do
        err = assert_raises RuntimeError do
          @asset_bucket.hard_delete_channel_content @channel
        end
        assert_match /Error deleting channel content/, err.message
      end
    end
  end
end
