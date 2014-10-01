require 'test_helper'

class NotesControllerTest< ActionController::TestCase
  test 'should get index' do
    get :index, key: 'maze_intro'
    assert_response :success
    assert_not_nil assigns(:slides)
  end

  test 'should use working images from English yml' do
    with_test_locale('he-IL') do
      get :index, key: 'flappy_intro'
      assert_not_nil assigns(:slides)
      assigns(:slides).values.each do |slide|
        assert_not_nil Rails.application.assets.find_asset(slide[:image])
      end
    end
  end

  test 'should show coming soon for missing slides' do
    get :index, key: 'nonexistent_slide_key'
    assert_template 'notes/coming_soon'
  end
end
