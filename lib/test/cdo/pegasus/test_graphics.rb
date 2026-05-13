require_relative '../../test_helper'
require 'sinatra/base'
require 'rmagick'
require 'cdo/pegasus/graphics'

FIXTURES_DIR = File.expand_path('../../../fixtures', __FILE__).freeze
IMAGE_EXTNAMES = ['.png', '.jpeg', '.jpg', '.gif'].freeze

# Minimal Sinatra stub that mimics SharedResources image handling,
# backed by test fixtures instead of deploy_dir.
class GraphicsAppForTest < Sinatra::Base
  helpers do
    def resolve_image(uri)
      IMAGE_EXTNAMES.each do |extname|
        path = File.join(FIXTURES_DIR, "#{uri}#{extname}")
        return path if File.file?(path)
      end
      nil
    end
  end

  get '/images/*' do |_path|
    path = request.path_info
    image_data = process_image(path, IMAGE_EXTNAMES)
    halt 404 if image_data.nil?
    content_type image_data[:content_type]
    return send_file(image_data[:file]) if image_data[:file]
    image_data[:content]
  end
end

class GraphicsTest < Minitest::Test
  include Rack::Test::Methods

  def app
    GraphicsAppForTest
  end

  # Image modification should return consistent results, since we will do
  # things like generate cache keys from modified images.
  #
  # See https://github.com/code-dot-org/code-dot-org/pull/67092
  def test_consistency
    test_image = deploy_dir('shared/images/courses/logo_artist.png')
    first_load = load_manipulated_image(test_image, :fill, 70, 70).to_blob

    # Let some time pass to validate that we don't get any inconsistency from
    # included "Modify Date" metadata. We need to use sleep here because the
    # underlying image libraries don't respect Timecop.
    sleep 1

    second_load = load_manipulated_image(test_image, :fill, 70, 70).to_blob
    assert_equal first_load, second_load
  end

  def assert_image_url(url, columns, rows)
    resp = get(url)
    assert_equal 200, resp.status, url
    image = Magick::Image.from_blob(resp.body).first
    assert_equal columns, image.columns, url if columns
    assert_equal rows, image.rows, url if rows
  end

  def assert_image(mode, path, columns, rows)
    assert_image_url "/images/#{mode}/#{path}", columns, rows
  end

  def assert_animated_image(url, frames)
    resp = get(url)
    assert_equal 200, resp.status, url
    assert_equal frames, Magick::ImageList.new.from_blob(resp.body).length
  end

  def test_process_image
    flag = 'flag_sphere.png'
    kids = 'kids4.png'
    kids_2x = 'kids4_2x.png'

    assert_image 'fit-320x10', flag, 10, 10
    assert_image 'fill-320x10', flag, 320, 10
    assert_image '320x10', flag, 320, 10

    # If only one dimension provided, assume a square
    assert_image 'fit-320', flag, 320, 320
    # If both dimensions are nil, assume the original image dimension
    # Assume we are returning the same resolution as we're reading.
    assert_image '', kids_2x, 2880, nil
    # Retina sources need to be downsampled for non-retina output
    assert_image '', kids, 1440, nil
    # Manipulated images always specify non-retina sizes in the manipulation string.
    assert_image '320', kids_2x, 640, nil
    # No [useful] modifications to make, return the original.
    assert_image 'x', flag, 256, nil

    # Didn't find a match at this resolution, look for a match at the other resolution.
    assert_image '320', 'flag_sphere_2x.jpg', 640, nil

    # Ensure animated images retain multiple layers after transformation.
    assert_animated_image '/images/fit-x200/flappy-game-space.gif', 61
  end
end
