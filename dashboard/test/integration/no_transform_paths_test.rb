require 'test_helper'

class NoTransformPathsTest < ActionDispatch::IntegrationTest
  def test_no_transform_paths
    path = '/blockly/media/skins/craft/images/fake_image.png'

    ActionDispatch::FileHandler.any_instance.stubs(:match?).returns(path)

    get path
    assert_match(/no-transform/, @response.headers[Rack::CACHE_CONTROL])
  end
end
