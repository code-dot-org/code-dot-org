require_relative '../../files_api_test_base' # Must be required first to establish load paths
require_relative '../../files_api_test_helper'
require 'cdo/aws/s3'

class PublicThumbnailsTest < FilesApiTestBase
  def setup
    @channel_id = create_channel
    @api = FilesApiTestHelper.new(current_session, 'files', @channel_id)
    @api.ensure_aws_credentials
    AWS::S3.create_client
    Aws::S3::Client.expects(:new).never
  end

  def teardown
    # Require that tests delete the assets they upload
    get "v3/files/#{@channel_id}"
    expected_empty_files = {
      'files' => [],
      'filesVersionId' => ''
    }
    assert_equal(expected_empty_files, JSON.parse(last_response.body))
    delete_channel(@channel_id)
    @channel_id = nil
  end

  def test_adult_thumbnail
    ImageModeration.stubs(:rate_image).returns :adult
    thumbnail_filename = '.metadata/thumbnail.png'
    thumbnail_body = 'stub-adult-thumbnail'

    # Intentional: Not yet checking/blocking adult content on upload.
    @api.put_object(thumbnail_filename, thumbnail_body)
    assert successful?

    get "/v3/files-public/#{@channel_id}/#{thumbnail_filename}"

    # Responds with a 404, like we do for flagged content
    assert not_found?

    # Includes content rating metadata in the response that the client can read
    assert_equal 'adult', last_response['x-cdo-content-rating']

    # Response is cached for an hour
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    # Flags the project as abusive.
    get "/v3/channels/#{@channel_id}/abuse"
    assert successful?
    assert_equal 15, JSON.parse(last_response.body)['abuse_score']

    # Flags the thumbnail as abusive
    thumbnail = FileBucket.new.get(@channel_id, thumbnail_filename)
    metadata = thumbnail[:metadata]
    thumbnail_abuse = [metadata['abuse_score'].to_i, metadata['abuse-score'].to_i].max
    assert_equal 15, thumbnail_abuse

    @api.delete_object(thumbnail_filename)
    assert successful?
  end

  def test_racy_thumbnail
    ImageModeration.stubs(:rate_image).returns :racy
    thumbnail_filename = '.metadata/thumbnail.png'
    thumbnail_body = 'stub-racy-thumbnail'

    # Intentional: Not yet checking/blocking adult content on upload.
    @api.put_object(thumbnail_filename, thumbnail_body)
    assert successful?

    get "/v3/files-public/#{@channel_id}/#{thumbnail_filename}"

    # Responds with a 404, like we do for flagged content
    assert not_found?

    # Includes content rating metadata in the response that the client can read
    assert_equal 'racy', last_response['x-cdo-content-rating']

    # Response is cached for an hour
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']

    # Flags the project as abusive.
    get "/v3/channels/#{@channel_id}/abuse"
    assert successful?
    assert_equal 15, JSON.parse(last_response.body)['abuse_score']

    # Flags the thumbnail as abusive
    thumbnail = FileBucket.new.get(@channel_id, thumbnail_filename)
    metadata = thumbnail[:metadata]
    thumbnail_abuse = [metadata['abuse_score'].to_i, metadata['abuse-score'].to_i].max
    assert_equal 15, thumbnail_abuse

    @api.delete_object(thumbnail_filename)
    assert successful?
  end

  def test_everyone_thumbnail
    ImageModeration.stubs(:rate_image).returns :everyone
    thumbnail_filename = '.metadata/thumbnail.png'
    thumbnail_body = 'stub-everyone-thumbnail'

    @api.put_object(thumbnail_filename, thumbnail_body)
    assert successful?

    get "/v3/files-public/#{@channel_id}/#{thumbnail_filename}"
    assert successful?
    assert_equal 'public, max-age=3600, s-maxage=1800', last_response['Cache-Control']
    assert_equal thumbnail_body, last_response.body

    # Does not flag the project as abusive
    get "/v3/channels/#{@channel_id}/abuse"
    assert successful?
    assert_equal 0, JSON.parse(last_response.body)['abuse_score']

    # Does not flag the thumbnail as abusive
    thumbnail = FileBucket.new.get(@channel_id, thumbnail_filename)
    metadata = thumbnail[:metadata]
    thumbnail_abuse = [metadata['abuse_score'].to_i, metadata['abuse-score'].to_i].max
    assert_equal 0, thumbnail_abuse

    @api.delete_object(thumbnail_filename)
    assert successful?
  end

  def test_bad_channel_thumbnail
    ImageModeration.expects(:rate_image).never

    get "/v3/files-public/undefined/.metadata/thumbnail.png"
    assert not_found?

    # Does not flag the project as abusive
    get "/v3/channels/#{@channel_id}/abuse"
    assert successful?
    assert_equal 0, JSON.parse(last_response.body)['abuse_score']
  end
end
