require 'test_helper'

class NotesControllerTest < ActionController::TestCase
  test 'should get index' do
    get :index, params: {key: 'maze_intro'}
    assert_response :success
    assert_not_nil assigns(:slides)
  end

  test 'should use working images from English yml' do
    with_locale('he-IL') do
      get :index, params: {key: 'flappy_intro'}
      assert_not_nil assigns(:slides)
      assets = Rails.application.assets || ::Sprockets::Railtie.build_environment(Rails.application)
      assigns(:slides).values.each do |slide|
        assert_not_nil assets.find_asset(slide[:image])
      end
    end
  end

  test 'should return 404 for missing slides' do
    get :index, params: {key: 'nonexistent_slide_key'}
    assert_response :not_found
  end
end
