require 'test_helper'

class MusiclabControllerTest < ActionController::TestCase
  test 'When DCDO flag is set to `false` get_channel_ids_from_featured_projects_gallery returns false' do
    DCDO.stubs(:get).with('get_channel_ids_from_featured_projects_gallery', true).returns(false)
    assert_equal false, @controller.send(:get_channel_ids_from_featured_projects_gallery?)
  end
end
