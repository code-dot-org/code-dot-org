require_relative 'test_helper'
require 'shared_resources'

class SharedResourcesTest < Minitest::Test
  include Rack::Test::Methods
  include SetupTest

  def build_rack_mock_session
    @session = Rack::MockSession.new(SharedResources, 'code.org')
  end

  def test_graphics
    get '/shared/images/gallery/fit-750/artist_gallery_thumbnails.png'
    assert last_response.ok?
  end
end
