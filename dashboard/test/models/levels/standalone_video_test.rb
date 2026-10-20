require 'test_helper'

class StandaloneVideoTest < ActiveSupport::TestCase
  test 'a Lab2 video level takes the small footer, like a full-width one' do
    plain = StandaloneVideo.new(video_key: 'maze_intro')
    refute plain.enable_scrolling?
    assert StandaloneVideo.new(video_key: 'maze_intro', video_full_width: true).enable_scrolling?
    assert StandaloneVideo.new(video_key: 'maze_intro', uses_lab2: true).enable_scrolling?
  end
end
