require_relative '../../files_api_test_base' # Must be required first to establish load paths
require_relative '../../files_api_test_helper'
require 'ostruct'

#
# Unlike AnimationsTest (test_animations.rb) which is essentially a controller
# test designed to fully exercise the public API, this is meant to be more like
# a unit test for AnimationBucket (animation_bucket.rb).
#
# However, we're using the FilesAPITestBase because some of the setup and
# teardown is easier to do through our actual API, and we want to use VCR
# to actually test S3 operations.
#
# The cdo-v3-animations bucket is versioned and may contain many objects.
#
class AnimationBucketTest < FilesApiTestBase
  def setup
    @animation_bucket = AnimationBucket.new
    @channel = create_channel

    @cat_png = 'cat.png'
    @dog_png = 'dog.png'

    # Start with an empty channel
    @animation_bucket.hard_delete_channel_content @channel
    assert_empty @animation_bucket.list @channel
    assert_empty @animation_bucket.list_versions @channel, @cat_png
    assert_empty @animation_bucket.list_versions @channel, @dog_png
  end

  def teardown
    # Require that tests delete the files they upload
    assert_empty @animation_bucket.list(@channel),
      "Expected no leftover animation files"
    assert_empty @animation_bucket.list_versions(@channel, @cat_png),
      "Expected no leftover cat.png versions"
    assert_empty @animation_bucket.list_versions(@channel, @dog_png),
      "Expected no leftover dog.png versions"

    delete_channel(@channel)
    @channel = nil
    @animation_bucket = nil
  end

  def test_hard_delete_channel_content
    @animation_bucket.create_or_replace @channel, @cat_png, 'cat-png-body'
    @animation_bucket.create_or_replace @channel, @dog_png, 'dog-png-body'

    refute_empty @animation_bucket.list(@channel)
    refute_empty @animation_bucket.list_versions(@channel, @cat_png)
    refute_empty @animation_bucket.list_versions(@channel, @dog_png)

    @animation_bucket.hard_delete_channel_content @channel

    assert_empty @animation_bucket.list(@channel)
    assert_empty @animation_bucket.list_versions(@channel, @cat_png)
    assert_empty @animation_bucket.list_versions(@channel, @dog_png)
  end

  def test_hard_delete_channel_content_noop
    assert_empty @animation_bucket.list(@channel)
    assert_empty @animation_bucket.list_versions(@channel, @cat_png)
    assert_empty @animation_bucket.list_versions(@channel, @dog_png)

    result = @animation_bucket.hard_delete_channel_content @channel
    assert_equal 0, result
  end

  def test_hard_delete_channel_content_many_versions
    @animation_bucket.create_or_replace @channel, @cat_png, 'cat-png-v1'
    @animation_bucket.create_or_replace @channel, @cat_png, 'cat-png-v2'
    @animation_bucket.create_or_replace @channel, @dog_png, 'dog-png-v1'
    @animation_bucket.create_or_replace @channel, @dog_png, 'dog-png-v2'
    @animation_bucket.create_or_replace @channel, @dog_png, 'dog-png-v3'

    assert_equal 2, @animation_bucket.list_versions(@channel, @cat_png).count
    assert_equal 3, @animation_bucket.list_versions(@channel, @dog_png).count

    @animation_bucket.hard_delete_channel_content @channel

    assert_empty @animation_bucket.list_versions(@channel, @cat_png)
    assert_empty @animation_bucket.list_versions(@channel, @dog_png)
  end

  def test_hard_delete_channel_content_delete_markers
    @animation_bucket.create_or_replace @channel, @cat_png, 'cat-png-v1'
    @animation_bucket.delete @channel, @cat_png
    @animation_bucket.create_or_replace @channel, @cat_png, 'cat-png-v2'
    @animation_bucket.delete @channel, @cat_png
    @animation_bucket.create_or_replace @channel, @dog_png, 'dog-png-v1'
    @animation_bucket.delete @channel, @dog_png

    assert_equal 2, @animation_bucket.list_delete_markers(@channel, @cat_png).count
    assert_equal 1, @animation_bucket.list_delete_markers(@channel, @dog_png).count

    @animation_bucket.hard_delete_channel_content @channel

    assert_empty @animation_bucket.list_delete_markers(@channel, @cat_png)
    assert_empty @animation_bucket.list_delete_markers(@channel, @dog_png)
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

    @animation_bucket.s3.stub :list_object_versions, fake_object_versions_response do
      @animation_bucket.s3.stub :delete_objects, fake_delete_objects_response do
        err = assert_raises RuntimeError do
          @animation_bucket.hard_delete_channel_content @channel
        end
        assert_match /Error deleting channel content/, err.message
      end
    end
  end
end
