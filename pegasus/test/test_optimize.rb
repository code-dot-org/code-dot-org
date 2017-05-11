require_relative './test_helper'
require 'active_support/cache'
require 'active_job'
require_relative '../router'
require 'dynamic_config/gatekeeper'

class OptimizeTest < Minitest::Test
  include Rack::Test::Methods

  def setup
    require 'cdo/optimizer'
    Cdo::Optimizer.stubs(cache: ActiveSupport::Cache::MemoryStore.new)
  end

  def app
    Rack::Builder.app do
      require 'cdo/rack/optimize'
      use Rack::Optimize
      run Documents
    end
  end

  LOGO_SIZE = 3374

  def test_optimize_image
    # First request returns original image, begins optimization in background.
    get('/images/logo.png')
    assert_equal LOGO_SIZE, last_response.content_length
    assert_equal 10, Rack::Cache::Response.new(*last_response.to_a).max_age

    # Ensure future request returns optimized image.
    Timeout.timeout(10) do
      begin
        get('/images/logo.png')
        raise 'not yet' unless last_response.content_length != LOGO_SIZE
      rescue
        sleep(0.1)
        retry
      end
    end

    get('/images/logo.png')
    assert_equal 799, last_response.content_length
    refute_equal 10, Rack::Cache::Response.new(*last_response.to_a).max_age
  end

  def test_skip_large_image
    original_image_size = 945_764
    large_image_path = '/images/affiliate-images/27459.jpg'

    get(large_image_path)
    assert_equal original_image_size, last_response.content_length
    sleep(0.1)
    get(large_image_path)
    # For large image, ImageOptim is not invoked and original image is returned.
    assert_equal original_image_size, last_response.content_length
  end

  def test_gatekeeper_disable
    Gatekeeper.set 'optimize', value: false
    assert_equal Gatekeeper.allows('optimize'), false

    # Returns original unoptimized image with full cache headers.
    get('/images/logo.png')
    assert_equal LOGO_SIZE, last_response.content_length
    assert_operator 10, :<, Rack::Cache::Response.new(*last_response.to_a).max_age
  ensure
    Gatekeeper.delete 'optimize'
  end
end
