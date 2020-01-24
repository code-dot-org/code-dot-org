require 'rack/test'
require 'minitest/autorun'
require_relative '../router'
require 'helpers/auth_helpers'

class HamlTest < Minitest::Test
  include Rack::Test::Methods

  def app
    Documents.new
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
