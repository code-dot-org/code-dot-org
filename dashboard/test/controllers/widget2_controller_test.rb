require 'test_helper'

class Widget2ControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create(:levelbuilder)
    @widget2_directory = "#{Widget2Helper::WIDGET2_BASE_DIRECTORY}/mywidget"
  end

  # Being on levelbuilder is not the same as being a levelbuilder.
  test_user_gets_response_for :index, user: nil, response: :redirect
  test_user_gets_response_for :index, user: :student, response: :forbidden
  test_user_gets_response_for :index, user: :teacher, response: :forbidden

  test_user_gets_response_for :new, method: :post, params: -> {{id: 'mywidget'}}, user: nil, response: :redirect
  test_user_gets_response_for :new, method: :post, params: -> {{id: 'mywidget'}}, user: :student, response: :forbidden
  test_user_gets_response_for :new, method: :post, params: -> {{id: 'mywidget'}}, user: :teacher, response: :forbidden

  test_user_gets_response_for :update_code, method: :post, params: -> {{widget2_id: 'mywidget'}}, user: nil, response: :redirect
  test_user_gets_response_for :update_code, method: :post, params: -> {{widget2_id: 'mywidget'}}, user: :student, response: :forbidden
  test_user_gets_response_for :update_code, method: :post, params: -> {{widget2_id: 'mywidget'}}, user: :teacher, response: :forbidden

  test 'levelbuilder can list widget2s' do
    sign_in @levelbuilder

    get :index
    assert_response :success
  end

  test 'levelbuilder can save widget2 sources' do
    sign_in @levelbuilder
    FileUtils.stubs(:mkdir_p)
    File.expects(:write).with("#{@widget2_directory}/index.html", '<p>hello</p>').once
    File.expects(:write).with("#{@widget2_directory}/style.css", 'p {color: red;}').once

    post :update_code, params: {
      widget2_id: 'mywidget',
      start_sources: {
        files: {
          '1' => {name: 'index.html', contents: '<p>hello</p>'},
          '2' => {name: 'style.css', contents: 'p {color: red;}'},
        },
      },
    }
    assert_response :success
  end

  test 'a widget2 id that is not a single path segment is rejected' do
    sign_in @levelbuilder
    FileUtils.stubs(:mkdir_p)
    File.expects(:write).never

    post :update_code, params: {
      widget2_id: '../../app/controllers',
      start_sources: {files: {'1' => {name: 'index.html', contents: 'nope'}}},
    }
    assert_response :bad_request
  end

  test 'a source file name that is not a single path segment is rejected' do
    sign_in @levelbuilder
    FileUtils.stubs(:mkdir_p)
    File.expects(:write).never

    post :update_code, params: {
      widget2_id: 'mywidget',
      start_sources: {files: {'1' => {name: '../../../app/controllers/pwned.rb', contents: 'nope'}}},
    }
    assert_response :bad_request
  end

  test 'a source file name with an unsupported extension is rejected' do
    sign_in @levelbuilder
    File.expects(:write).never

    post :update_code, params: {
      widget2_id: 'mywidget',
      start_sources: {files: {'1' => {name: 'initializer.rb', contents: 'nope'}}},
    }
    assert_response :bad_request
  end

  test 'no file is written when one name in the save is rejected' do
    sign_in @levelbuilder
    File.expects(:write).never

    post :update_code, params: {
      widget2_id: 'mywidget',
      start_sources: {
        files: {
          '1' => {name: 'index.html', contents: '<p>hello</p>'},
          '2' => {name: '../../../app/controllers/pwned.rb', contents: 'nope'},
        },
      },
    }
    assert_response :bad_request
  end

  test 'levelbuilder is sent to the editor for a new widget2' do
    sign_in @levelbuilder
    level = create(:weblab2, name: 'New Web Lab 2 Project')

    post :new, params: {id: 'mywidget'}
    assert_redirected_to "/levels/#{level.id}/edit_blocks/widget2_sources?widget2=mywidget"
  end

  test 'a new widget2 with an invalid id returns to the widget2 list' do
    sign_in @levelbuilder

    post :new, params: {id: '../../app/controllers'}
    assert_redirected_to '/widget2'
    assert_match 'Invalid widget2 id', flash[:alert]
  end
end
