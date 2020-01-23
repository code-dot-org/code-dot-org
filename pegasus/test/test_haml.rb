require 'rack/test'
require 'minitest/autorun'
require_relative '../router'
require 'helpers/auth_helpers'

class HamlTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Documents.new
  end

  def setup
    # Ensure that AssetHelper#webpack_asset_path does not raise an exception
    # when called from unit tests. See comments on that method for details.
    CDO.stubs(optimize_webpack_assets: false)
    CDO.stubs(use_my_apps: true)
  end

  def test_resources_videos
    path = '/educate/resources/videos'
    resp = get(path)
    assert_equal 200, resp.status, path
    match = /&quot;/
    quot = resp.body.match(match)
    assert_nil quot, "Javascript block quoted incorrectly in #{path}"
  end
end
