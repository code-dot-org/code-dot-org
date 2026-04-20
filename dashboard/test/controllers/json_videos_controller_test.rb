require 'test_helper'

class JSONVideosControllerTest < ActionController::TestCase
  setup do
    @student = create(:student)
    @video = create(:json_video, key: 'test-video', s3_uri: 's3://my-bucket/path/to/video.json')
  end

  test 'unauthenticated request to content redirects' do
    get :content, params: {id: @video.key}
    assert_response :redirect
  end

  test 'content returns 404 for unknown key' do
    sign_in @student
    get :content, params: {id: 'does-not-exist'}
    assert_response :not_found
  end

  test 'content returns json body for known key' do
    sign_in @student
    AWS::S3.stubs(:download_from_bucket).with('my-bucket', 'path/to/video.json').returns('{"frames":[]}')

    get :content, params: {id: @video.key}

    assert_response :success
    assert_includes response.content_type, 'application/json'
    assert_equal '{"frames":[]}', response.body
  end

  test 'content returns 502 when S3 raises' do
    sign_in @student
    AWS::S3.stubs(:download_from_bucket).raises(RuntimeError, 'connection error')

    get :content, params: {id: @video.key}

    assert_response :bad_gateway
  end
end
