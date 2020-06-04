require_relative 'test_helper'
require 'animation_library_api'

class AnimationLibraryTest < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  def build_rack_mock_session
    @session = Rack::MockSession.new(AnimationLibraryApi, 'studio.code.org')
  end

  def test_animation_not_found
    get '/api/v1/animation-library/spritelab/version/animation_not_found.png'
    assert last_response.not_found?
  end

  def test_get_spritelab_animation
    contents = 'TEST_ANIMATION'
    # Ensure the shared S3 client is used by stubbing the client with the expected response.
    AWS::S3.s3 = Aws::S3::Client.new(
      stub_responses: {
        get_object: {body: contents, content_type: 'image/png'}
      }
    )
    get '/api/v1/animation-library/spritelab/version/test_animation.png'
    assert last_response.ok?
    assert_equal contents, last_response.body
  ensure
    AWS::S3.s3 = nil
  end

  def test_get_gamelab_animation
    contents = 'TEST_ANIMATION'
    # Ensure the shared S3 client is used by stubbing the client with the expected response.
    AWS::S3.s3 = Aws::S3::Client.new(
      stub_responses: {
        get_object: {body: contents, content_type: 'image/png'}
      }
    )
    get '/api/v1/animation-library/gamelab/version/test_animation.png'
    assert last_response.ok?
    assert_equal contents, last_response.body
  ensure
    AWS::S3.s3 = nil
  end

  def test_not_found
    get '/api/v1/animation-library/animation_not_found.png'
    assert last_response.not_found?
    get '/api/v1/animation-library/xyz/'
    assert last_response.not_found?
  end

  def test_get_animation
    contents = 'TEST_ANIMATION'
    # Ensure the shared S3 client is used by stubbing the client with the expected response.
    AWS::S3.s3 = Aws::S3::Client.new(
      stub_responses: {
        get_object: {body: contents, content_type: 'image/png'}
      }
    )
    get '/api/v1/animation-library/version/test_animation.png'
    assert last_response.ok?
    assert_equal contents, last_response.body
  ensure
    AWS::S3.s3 = nil
  end
end
