require_relative '../files_api_test_base' # Must be required first to establish load paths
require_relative '../files_api_test_helper'
require 'cdo/aws/s3'

class PublicThumbnailsTest < FilesApiTestBase
  def setup
    @thumbnail_filename = '.metadata/thumbnail.png'
    @thumbnail_body = 'stub-thumbnail-body'
    AWS::S3.create_client
    Aws::S3::Client.expects(:new).never
  end

  def test_cached_thumbnail
    with_project_type('applab') do |channel_id|
      get "/v3/files-public/#{channel_id}/#{@thumbnail_filename}"
      assert successful?
      cache_control = last_response['Cache-Control']
      assert_includes cache_control, 'public'
      assert_includes cache_control, 'max-age=3600'
      assert_includes cache_control, 's-maxage=1800'
      assert_equal @thumbnail_body, last_response.body
    end
  end

  def test_bad_channel_thumbnail
    get "/v3/files-public/undefined/.metadata/thumbnail.png"
    assert not_found?
  end

  # Creates a channel of the given type, with a thumbnail populated.
  # Yields the channel id to the provided block.
  # Performs cleanup of the thumbnail and channel when the block ends.
  private def with_project_type(project_type)
    # Setup
    channel_id = create_channel(projectType: project_type)
    create_thumbnail(channel_id)

    # Test
    yield channel_id
  ensure
    delete_thumbnail(channel_id)

    # Require that tests delete the assets they upload
    get "v3/files/#{channel_id}"
    assert not_found?

    delete_channel(channel_id)
  end

  private def create_thumbnail(channel_id)
    put "/v3/files/#{channel_id}/#{@thumbnail_filename}", @thumbnail_body, {}
    assert successful?
  end

  private def delete_thumbnail(channel_id)
    delete "/v3/files/#{channel_id}/#{@thumbnail_filename}"
    assert successful?
  end
end
