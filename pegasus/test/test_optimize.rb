require_relative './test_helper'
require 'active_support/cache'
require 'active_job'
require_relative '../router'

module Cdo
  class OptimizeJob < ActiveJob::Base
  end
end

class ImageOptim
end

class OptimizeTest < Minitest::Test
  include Rack::Test::Methods

  def setup
    # Stub image_optim dependencies not available in unit-test environment.
    Cdo::OptimizeJob.stubs(:require)
    @image_optim = mock('double')
    ::ImageOptim.stubs(new: @image_optim)

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

  def test_optimize_image
    compressed_image = 'compressed-image-data'
    @image_optim.expects(:optimize_image_data).returns(compressed_image)

    # First request returns original image, begins optimization in background.
    get('/images/logo.png')
    assert_equal 3374, last_response.content_length
    assert_equal 10, Rack::Cache::Response.new(*last_response.to_a).max_age

    sleep(0.1)

    # Second request returns optimized image.
    get('/images/logo.png')
    assert_equal compressed_image.length, last_response.content_length
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
end
