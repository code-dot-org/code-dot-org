require 'webmock/minitest'
WebMock.disable_net_connect!(allow_localhost: true)
require 'test_helper'

class ProgrammingEnvironmentsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    File.stubs(:write)
    @levelbuilder = create :levelbuilder
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    Unit.stubs(:should_cache?).returns false
  end

  test 'data is passed down to edit page' do
    sign_in @levelbuilder

    programming_environment = create :programming_environment

    get :edit, params: {name: programming_environment.name}
    assert_response :ok

    edit_data = JSON.parse(css_select('script[data-programmingenvironment]').first.attribute('data-programmingenvironment').to_s)
    assert_equal programming_environment.name, edit_data['name']
  end

  test 'data is passed down to show page' do
    sign_in @levelbuilder

    programming_environment = create :programming_environment
    category = create :programming_environment_category, programming_environment: programming_environment
    create :programming_environment_category, programming_environment: programming_environment
    create :programming_expression, programming_environment: programming_environment, programming_environment_category: category

    get :show, params: {name: programming_environment.name}
    assert_response :ok

    show_data = css_select('script[data-programmingenvironment]').first.attribute('data-programmingenvironment').to_s
    assert_equal programming_environment.summarize_for_show.to_json, show_data

    nav_data = css_select('script[data-categoriesfornavigation]').first.attribute('data-categoriesfornavigation').to_s
    assert_equal 1, JSON.parse(nav_data).length
  end

  test 'redirects to docs show page url if using studio code docs' do
    Rails.application.config.stubs(:levelbuilder_mode).returns false

    programming_environment = create :programming_environment, name: 'weblab'
    category = create :programming_environment_category, programming_environment: programming_environment
    create :programming_environment_category, programming_environment: programming_environment
    create :programming_expression, programming_environment: programming_environment, programming_environment_category: category

    get :docs_show, params: {programming_environment_name: programming_environment.name}
    assert_response :redirect
  end

  test 'page is not proxied to docs index if using studio code docs' do
    Rails.application.config.stubs(:levelbuilder_mode).returns false

    create :programming_environment
    stubbed_request = stub_request(:get, "https://curriculum.code.org/docs/").
                      to_return(body: 'curriculum.code.org/docs content', headers: {})

    get :docs_index
    assert_response :ok
    assert_not_requested stubbed_request
  end

  test 'returns not_found if editing a non-existant programming environment' do
    sign_in @levelbuilder

    assert_raises(ActiveRecord::RecordNotFound) do
      post :edit, params: {
        name: 'fake_name'
      }
    end
  end

  test 'can update programming expression from params' do
    sign_in @levelbuilder

    programming_environment = create :programming_environment
    File.expects(:write).with {|filename, _| filename.to_s.end_with? "#{programming_environment.name}.json"}.once
    post :update, params: {
      name: programming_environment.name,
      title: 'title',
      description: 'description',
      editorLanguage: 'blockly',
      blockPoolName: 'GamelabJr',
      projectUrl: '/p/project'
    }
    assert_response :ok

    programming_environment.reload
    assert_equal 'title', programming_environment.title
    assert_equal 'description', programming_environment.description
    assert_equal 'blockly', programming_environment.editor_language
    assert_equal 'GamelabJr', programming_environment.block_pool_name
    assert_equal '/p/project', programming_environment.project_url
  end

  test 'can update programming expression categories from params' do
    sign_in @levelbuilder

    programming_environment = create :programming_environment
    category_to_keep = create :programming_environment_category, programming_environment: programming_environment, position: 0
    category_to_destroy = create :programming_environment_category, programming_environment: programming_environment, position: 1
    File.expects(:write).with {|filename, _| filename.to_s.end_with? "#{programming_environment.name}.json"}.once
    post :update, params:
      {
        name: programming_environment.name,
        title: 'title',
        editorLanguage: 'blockly',
        categories: [{id: nil, name: 'brand new category', color: '#00FFFF'}, {id: category_to_keep.id, name: category_to_keep.name, color: category_to_keep.color}]
      }
    assert_response :ok

    programming_environment.reload
    assert_includes(programming_environment.categories, category_to_keep)
    refute_includes(programming_environment.categories, category_to_destroy)
    assert_equal 2, programming_environment.categories.count
    assert_equal ['brand new category', category_to_keep.name], programming_environment.categories.map(&:name)
  end

  test 'returns not_found if updating a non-existant programming environment' do
    sign_in @levelbuilder

    assert_raises(ActiveRecord::RecordNotFound) do
      post :update, params: {
        name: 'fake_name',
        title: 'title'
      }
    end
  end

  test 'can create a new programming environment' do
    @request.host = CDO.dashboard_hostname
    sign_in @levelbuilder

    File.expects(:write).with {|filename, _| filename.to_s.end_with? "new-ide.json"}.once
    post :create, params: {
      name: 'new-ide'
    }
    assert_redirected_to '/programming_environments/new-ide/edit'
  end

  test 'creating a new programming environment with an invalid name returns an error' do
    sign_in @levelbuilder

    File.expects(:write).never
    post :create, params: {
      name: 'new ide with ~bad symbols~'
    }
    assert_response :not_acceptable
  end

  test 'can destroy a programming environment' do
    sign_in @levelbuilder

    programming_environment = create :programming_environment, name: 'test-environment'

    FileUtils.expects(:rm_f).once
    delete :destroy, params: {
      name: programming_environment.name
    }
    assert_response :ok
    assert_nil ProgrammingEnvironment.find_by_name('test-environment')
  end

  test 'destroying a programming environment fails if File cannot be deleted' do
    sign_in @levelbuilder

    programming_environment = create :programming_environment, name: 'test-environment'

    FileUtils.expects(:rm_f).throws(StandardError).once
    delete :destroy, params: {
      name: programming_environment.name
    }
    assert_response :not_acceptable
    refute_nil ProgrammingEnvironment.find_by_name('test-environment')
  end

  test 'can get summary by name' do
    programming_environment = create :programming_environment, name: 'test-environment', published: true
    programming_category = create :programming_environment_category, name: 'test-category', programming_environment_id: programming_environment.id
    programming_class = create :programming_class, name: 'test-class', programming_environment_category_id: programming_category.id, programming_environment_id: programming_environment.id
    get :get_summary_by_name, params: {name: programming_environment.name}
    assert_response :ok
    response = JSON.parse(@response.body)
    assert_equal 1, response.length
    assert_equal programming_category.name, response[0]["name"]
    assert_equal programming_class.name, response[0]["docs"][0]["name"]
  end

  class AccessTests < ActionController::TestCase
    setup do
      File.stubs(:write)
      @published_programming_environment = create :programming_environment, published: true
      @unpublished_programming_environment = create :programming_environment, published: false

      @update_params = {name: @published_programming_environment.name, title: 'new title'}
    end

    test_user_gets_response_for :new, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :new, user: :student, response: :forbidden
    test_user_gets_response_for :new, user: :teacher, response: :forbidden
    test_user_gets_response_for :new, user: :levelbuilder, response: :success

    test_user_gets_response_for :edit, params: -> {{name: @published_programming_environment.name}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :edit, params: -> {{name: @published_programming_environment.name}}, user: :student, response: :forbidden
    test_user_gets_response_for :edit, params: -> {{name: @published_programming_environment.name}}, user: :teacher, response: :forbidden
    test_user_gets_response_for :edit, params: -> {{name: @published_programming_environment.name}}, user: :levelbuilder, response: :success

    test_user_gets_response_for :update, params: -> {@update_params}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :update, params: -> {@update_params}, user: :student, response: :forbidden
    test_user_gets_response_for :update, params: -> {@update_params}, user: :teacher, response: :forbidden
    test_user_gets_response_for :update, params: -> {@update_params}, user: :levelbuilder, response: :success

    test_user_gets_response_for :show, params: -> {{name: @published_programming_environment.name}}, user: nil, response: :success, name: 'signed out user can view published programming environment'
    test_user_gets_response_for :show, params: -> {{name: @published_programming_environment.name}}, user: :student, response: :success, name: 'student can view published programming environment'
    test_user_gets_response_for :show, params: -> {{name: @published_programming_environment.name}}, user: :teacher, response: :success, name: 'teacher can view published programming environment'
    test_user_gets_response_for :show, params: -> {{name: @published_programming_environment.name}}, user: :levelbuilder, response: :success, name: 'levelbuilder can view published programming environment'

    test_user_gets_response_for :show, params: -> {{name: @unpublished_programming_environment.name}}, user: nil, response: :forbidden, name: 'signed out user cannot view unpublished programming environment'
    test_user_gets_response_for :show, params: -> {{name: @unpublished_programming_environment.name}}, user: :student, response: :forbidden, name: 'student cannot view unpublished programming environment'
    test_user_gets_response_for :show, params: -> {{name: @unpublished_programming_environment.name}}, user: :teacher, response: :forbidden, name: 'teacher cannot view unpublished programming environment'
    test_user_gets_response_for :show, params: -> {{name: @published_programming_environment.name}}, user: :levelbuilder, response: :success, name: 'levelbuilder can view unpublished programming environment'

    test_user_gets_response_for :destroy, params: -> {{name: @published_programming_environment.name}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :destroy, params: -> {{name: @published_programming_environment.name}}, user: :student, response: :forbidden
    test_user_gets_response_for :destroy, params: -> {{name: @published_programming_environment.name}}, user: :teacher, response: :forbidden
    test_user_gets_response_for :destroy, params: -> {{name: @published_programming_environment.name}}, user: :levelbuilder, response: :success

    test_user_gets_response_for :index, user: nil, response: :success
    test_user_gets_response_for :index, user: :student, response: :success
    test_user_gets_response_for :index, user: :teacher, response: :success
    test_user_gets_response_for :index, user: :levelbuilder, response: :success

    test_user_gets_response_for :get_summary_by_name, params: -> {{name: @published_programming_environment.name}}, user: nil, response: :success, name: 'signed out user can get summary of published programming environment'
    test_user_gets_response_for :get_summary_by_name, params: -> {{name: @published_programming_environment.name}}, user: :student, response: :success, name: 'student can get summary of published programming environment'
    test_user_gets_response_for :get_summary_by_name, params: -> {{name: @published_programming_environment.name}}, user: :teacher, response: :success, name: 'teacher can get summary of published programming environment'
    test_user_gets_response_for :get_summary_by_name, params: -> {{name: @published_programming_environment.name}}, user: :levelbuilder, response: :success, name: 'levelbuilder can get summary of published programming environment'

    test_user_gets_response_for :get_summary_by_name, params: -> {{name: @unpublished_programming_environment.name}}, user: nil, response: :forbidden, name: 'signed out user cannot get summary of unpublished programming environment'
    test_user_gets_response_for :get_summary_by_name, params: -> {{name: @unpublished_programming_environment.name}}, user: :student, response: :forbidden, name: 'student cannot get summary of unpublished programming environment'
    test_user_gets_response_for :get_summary_by_name, params: -> {{name: @unpublished_programming_environment.name}}, user: :teacher, response: :forbidden, name: 'teacher cannot get summary of unpublished programming environment'
    test_user_gets_response_for :get_summary_by_name, params: -> {{name: @published_programming_environment.name}}, user: :levelbuilder, response: :success, name: 'levelbuilder can get summary of unpublished programming environment'
  end
end
