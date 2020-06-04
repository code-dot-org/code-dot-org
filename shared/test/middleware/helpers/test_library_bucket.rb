require_relative '../../files_api_test_base' # Must be required first to establish load paths
require_relative '../../files_api_test_helper'
require 'ostruct'

#
# Unlike LibrariesTest (test_libraries.rb) which is essentially a controller
# test designed to fully exercise the public API, this is meant to be more like
# a unit test for LibraryBucket (library_bucket.rb).
#
# However, we're using the FilesAPITestBase because some of the setup and
# teardown is easier to do through our actual API, and we want to use VCR
# to actually test S3 operations.
#
# The cdo-v3-libraries bucket is versioned and may contain many objects.
#
class LibraryBucketTest < FilesApiTestBase
  def setup
    @library_bucket = LibraryBucket.new
    @channel = create_channel

    @library_name = 'library.json'

    # Start with an empty channel
    @library_bucket.hard_delete_channel_content @channel
    assert_empty @library_bucket.list @channel
    assert_empty @library_bucket.list_versions @channel, @library_name
  end

  def teardown
    # Require that tests delete the files they upload
    assert_empty @library_bucket.list(@channel),
      "Expected no leftover library files"
    assert_empty @library_bucket.list_versions(@channel, @library_name),
      "Expected no leftover library.json versions"

    delete_channel(@channel)
    @channel = nil
    @library_bucket = nil
  end

  def test_hard_delete_channel_content
    @library_bucket.create_or_replace @channel, @library_name, '{"library":"library"}'

    refute_empty @library_bucket.list(@channel)
    refute_empty @library_bucket.list_versions(@channel, @library_name)

    @library_bucket.hard_delete_channel_content @channel

    assert_empty @library_bucket.list(@channel)
    assert_empty @library_bucket.list_versions(@channel, @library_name)
  end

  def test_hard_delete_channel_content_noop
    assert_empty @library_bucket.list(@channel)
    assert_empty @library_bucket.list_versions(@channel, @library_name)

    result = @library_bucket.hard_delete_channel_content @channel
    assert_equal 0, result
  end

  def test_hard_delete_channel_content_many_versions
    @library_bucket.create_or_replace @channel, @library_name, '{"library":"library"}'
    @library_bucket.create_or_replace @channel, @library_name, '{"library":"library2"}'

    assert_equal 2, @library_bucket.list_versions(@channel, @library_name).count

    @library_bucket.hard_delete_channel_content @channel

    assert_empty @library_bucket.list_versions(@channel, @library_name)
  end

  def test_hard_delete_channel_content_delete_markers
    @library_bucket.create_or_replace @channel, @library_name, '{"library":"library"}'
    @library_bucket.delete @channel, @library_name
    @library_bucket.create_or_replace @channel, @library_name, '{"library":"library2"}'
    @library_bucket.delete @channel, @library_name

    assert_equal 2, @library_bucket.list_delete_markers(@channel, @library_name).count

    @library_bucket.hard_delete_channel_content @channel

    assert_empty @library_bucket.list_delete_markers(@channel, @library_name)
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

    @library_bucket.s3.stub :list_object_versions, fake_object_versions_response do
      @library_bucket.s3.stub :delete_objects, fake_delete_objects_response do
        err = assert_raises RuntimeError do
          @library_bucket.hard_delete_channel_content @channel
        end
        assert_match /Error deleting channel content/, err.message
      end
    end
  end
end
