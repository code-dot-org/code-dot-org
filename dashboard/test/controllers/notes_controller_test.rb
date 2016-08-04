require 'test_helper'

class NotesControllerTest < ActionController::TestCase
  test 'should get index' do
    get :index, key: 'maze_intro'
    assert_response :success
    assert_not_nil assigns(:slides)
  end

  test 'should use working images from English yml' do
    with_default_locale('he-IL') do
      get :index, key: 'flappy_intro'
      assert_not_nil assigns(:slides)
      assigns(:slides).values.each do |slide|
        assert_not_nil Rails.application.assets.find_asset(slide[:image])
      end
    end
  end

  test 'should raise RuntimeError if there is no slide in english' do
    # there is no slide 100 in english
    fake_slides = {100 => {image: 'notes/flappy01.jpg', text: 'here is some text'}}
    @controller.stubs(:params).returns({key: 'flappy_intro'})
    assert_raises(RuntimeError) do
      @controller.send(:fix_slide_images, fake_slides)
    end
  end

  test 'should return 404 for missing slides' do
    get :index, key: 'nonexistent_slide_key'
    assert_response :not_found
  end
end
