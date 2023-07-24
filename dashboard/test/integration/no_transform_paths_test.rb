require 'test_helper'

class NoTransformPathsTest < ActionDispatch::IntegrationTest
  def test_no_transform_paths
    path = '/blockly/media/skins/craft/images/fake_image.png'

    # Allow this fake path to be served as if it were real by reaching into
    # Rails internals and making any path get served as if it were real. Note
    # that this is somewhat fragile, and may break in future versions of Rails.
    ActionDispatch::FileHandler.any_instance.stubs(:file_readable?).returns(true)

    get path
    assert_match(/no-transform/, @response.headers[Rack::CACHE_CONTROL])
  end
end
