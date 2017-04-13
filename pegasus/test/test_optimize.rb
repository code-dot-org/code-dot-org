require_relative './test_helper'
require 'active_support/cache'
require 'active_job'

module Cdo
  class OptimizeJob < ActiveJob::Base
  end
end

class ImageOptim
end

class OptimizeTest < Minitest::Test
  include Rack::Test::Methods

  def setup
    CDO.stubs(image_optim: true)
    Cdo::OptimizeJob.stubs(:require).with('image_compressor_pack')
    Cdo::OptimizeJob.stubs(:require).with('image_optim')

    @image_optim = mock('double')
    ::ImageOptim.stubs(new: @image_optim)

    require 'cdo/optimizer'
    Cdo::Optimizer.stubs(cache: ActiveSupport::Cache::MemoryStore.new)
  end

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  def test_optimize_image
    compressed_image = 'compressed-image-data'
    @image_optim.expects(:optimize_image_data).returns(compressed_image)

    get('/images/logo.png')
    assert_equal 3374, last_response.content_length

    get('/images/logo.png')
    assert_equal compressed_image.length, last_response.content_length
  end
end
