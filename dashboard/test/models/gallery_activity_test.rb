require 'test_helper'

class GalleryActivityTest < ActiveSupport::TestCase
  setup do
    @gallery_activity = create :gallery_activity
  end

  test 'set_app setss app from user_level' do
    @gallery_activity.level_source = nil
    @gallery_activity.set_app
    assert_equal 'maze', @gallery_activity.app
  end

  test 'set_app sets app from level_source' do
    @gallery_activity.user_level = nil
    @gallery_activity.set_app
    assert_equal 'turtle', @gallery_activity.app
  end

  test 'set_app prioritizes user_level' do
    @gallery_activity.set_app
    assert_equal 'maze', @gallery_activity.user_level.level.game.app
    assert_equal 'turtle', @gallery_activity.level_source.level.game.app
    assert_equal 'maze', @gallery_activity.app
  end
end
