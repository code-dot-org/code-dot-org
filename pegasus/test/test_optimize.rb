require_relative './test_helper'
require 'active_support/cache'
require 'active_job'
require_relative '../router'

module Cdo
  class OptimizeJob < ActiveJob::Base
  end
end

class ImageSize
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
    @image_size = mock('double')
    ::ImageSize.stubs(new: @image_size)

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
    @image_size.expects(:size).returns([1, 1])

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
end
