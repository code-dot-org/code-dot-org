require 'test_helper'

class NotesHelperTest < ActionController::TestCase
  include NotesHelper

  test 'should return nil if there are no slides for the given key' do
    slides = get_slides_by_video_key('some key that does not exist')
    assert_nil slides
  end

  test 'should raise NoMethodError if there is no slide in english' do
    # return an arbitrary set of slides for any language except english
    fake_slides = {100 => {image: 'notes/flappy01.jpg', text: 'here is some text'}}
    stubs(:try_t).returns(fake_slides)
    stubs(:try_t).with {|*args| args[1] && args[1][:locale] == :en}.returns(nil)

    assert_raises(NoMethodError) do
      with_locale('it-IT') do
        get_slides_by_video_key('flappy_intro')
      end
    end
  end
end
