require 'rack/test'
require 'minitest/autorun'
ENV['RACK_ENV'] = 'test'

class GraphicsTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Rack::Builder.parse_file(File.absolute_path('../config.ru', __dir__)).first
  end

  def test_process_image
    [''] + %w(
      fit-320
      fill-320
      fit-320x200
      fill-320x200
    ).map do |mode|
      url = "/images/#{mode}/avatars/flag_sphere.png"
      response = get url
      assert_equal 200, response.status, "Error in #{url}"

      # Downsample from kids4_2x.jpg
      url = "/images/#{mode}/homepage/kids4.jpg"
      response = get url
      assert_equal 200, response.status, "Error in #{url}"
    end
  end
end
