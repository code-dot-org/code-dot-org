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

  test 'sources in a folder are written into that folder and assets are left alone' do
    sign_in @levelbuilder
    FileUtils.expects(:mkdir_p).with("#{@widget2_directory}/components").once
    FileUtils.expects(:mkdir_p).with(@widget2_directory).once
    File.expects(:write).with("#{@widget2_directory}/index.html", '<p>hello</p>').once
    File.expects(:write).with("#{@widget2_directory}/components/coin.js", 'flip();').once

    post :update_code, params: {
      widget2_id: 'mywidget',
      start_sources: {
        folders: {'1' => {id: '1', name: 'components', parentId: '0'}},
        files: {
          '1' => {name: 'index.html', contents: '<p>hello</p>', folderId: '0'},
          '2' => {name: 'coin.js', contents: 'flip();', folderId: '1'},
          '3' => {name: 'otter.jpg', url: '/widget2/mywidget/otter.jpg', folderId: '0'},
        },
      },
    }
    assert_response :success
  end

  test 'a folder name that is not a single path segment is rejected' do
    sign_in @levelbuilder
    File.expects(:write).never

    post :update_code, params: {
      widget2_id: 'mywidget',
      start_sources: {
        folders: {'1' => {id: '1', name: '../../app', parentId: '0'}},
        files: {'1' => {name: 'index.html', contents: 'nope', folderId: '1'}},
      },
    }
    assert_response :bad_request
  end

  test 'a nested folder is rejected' do
    sign_in @levelbuilder
    File.expects(:write).never

    post :update_code, params: {
      widget2_id: 'mywidget',
      start_sources: {
        folders: {
          '1' => {id: '1', name: 'assets', parentId: '0'},
          '2' => {id: '2', name: 'deep', parentId: '1'},
        },
        files: {'1' => {name: 'index.html', contents: 'nope', folderId: '2'}},
      },
    }
    assert_response :bad_request
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

  # Assets are fetched by the sandboxed preview of any level using the widget2, so they
  # are public and cross-origin readable from the preview hosts only.
  test 'anyone can fetch a widget2 asset' do
    with_widget2_on_disk do
      get :asset, params: {widget2_id: 'mywidget', path: 'assets/otter.jpg'}
      assert_response :success
      assert_equal 'image/jpeg', response.media_type
      assert_equal 'JPEGDATA', response.body
    end
  end

  test 'a widget2 asset is cross-origin readable from a preview host' do
    with_widget2_on_disk do
      origin = "https://abc.preview.#{CDO.preview_codeprojects_hostname}"
      @request.headers['Origin'] = origin
      get :asset, params: {widget2_id: 'mywidget', path: 'assets/otter.jpg'}
      assert_response :success
      assert_equal origin, response.headers['Access-Control-Allow-Origin']
    end
  end

  test 'a widget2 asset is not cross-origin readable from another host' do
    with_widget2_on_disk do
      @request.headers['Origin'] = 'https://evil.example.com'
      get :asset, params: {widget2_id: 'mywidget', path: 'assets/otter.jpg'}
      assert_response :success
      assert_nil response.headers['Access-Control-Allow-Origin']
    end
  end

  test 'a text source is not served as an asset' do
    with_widget2_on_disk do
      get :asset, params: {widget2_id: 'mywidget', path: 'index.html'}
      assert_response :not_found
    end
  end

  test 'an asset path that escapes the widget2 tree is not found' do
    with_widget2_on_disk do
      get :asset, params: {widget2_id: 'mywidget', path: '../other/assets/otter.jpg'}
      assert_response :not_found
      get :asset, params: {widget2_id: '../mywidget', path: 'assets/otter.jpg'}
      assert_response :not_found
    end
  end

  test 'a missing asset is not found' do
    with_widget2_on_disk do
      get :asset, params: {widget2_id: 'mywidget', path: 'assets/nope.jpg'}
      assert_response :not_found
    end
  end

  # Point the widget2 tree at a temporary directory holding one widget2.
  private def with_widget2_on_disk(&block)
    Dir.mktmpdir do |base|
      FileUtils.mkdir_p("#{base}/mywidget/assets")
      File.write("#{base}/mywidget/index.html", '<p>hello</p>')
      File.write("#{base}/mywidget/assets/otter.jpg", 'JPEGDATA')
      Widget2Helper.stub_const(:WIDGET2_BASE_DIRECTORY, base, &block)
    end
  end
end
