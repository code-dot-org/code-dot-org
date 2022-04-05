require 'test_helper'

class ProgrammingClassesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    File.stubs(:write)
    FileUtils.stubs(:mkdir_p)
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder
    @programming_environment = create :programming_environment
  end

  test 'can create programming class from params' do
    sign_in @levelbuilder
    File.expects(:write).once
    assert_creates(ProgrammingClass) do
      post :create, params: {key: 'class_key', name: 'class name', programming_environment_id: @programming_environment.id}
    end
  end

  test 'cannot create programming class with nonexistant programming environment' do
    sign_in @levelbuilder
    destroyed_programming_env_id = @programming_environment.id
    @programming_environment.destroy!
    refute_creates(ProgrammingClass) do
      post :create, params: {key: 'class_key', name: 'class name', programming_environment_id: destroyed_programming_env_id}
    end
    assert @response.body.include? "Valid programming environment is required"
  end

  test 'can update programming class from params' do
    sign_in @levelbuilder
    File.expects(:write).once

    programming_class = create :programming_class, programming_environment: @programming_environment
    category = create :programming_environment_category, programming_environment: @programming_environment

    post :update, params: {
      id: programming_class.id,
      key: programming_class.key,
      name: 'new name',
      categoryKey: category.key,
      externalDocumentation: 'google.com',
      content: 'a longer description of the code',
      syntax: 'new Class()',
      tips: 'some tips on how to use this class',
      examples: [{name: 'example 1', embed_app_with_code_height: '300px'}],
      fields: [{name: 'field 1', type: 'int'}]
    }
    assert_response :ok
    programming_class.reload

    assert_equal 'new name', programming_class.name
    assert_equal category, programming_class.programming_environment_category
    assert_equal 'google.com', programming_class.external_documentation
    assert_equal 'a longer description of the code', programming_class.content
    assert_equal 'new Class()', programming_class.syntax
    assert_equal 'some tips on how to use this class', programming_class.tips
    assert_equal [{name: 'example 1', embed_app_with_code_height: '300px'}].to_json, programming_class.examples
    assert_equal [{name: 'field 1', type: 'int'}].to_json, programming_class.fields
  end

  test 'data is passed down to edit page' do
    sign_in @levelbuilder

    programming_class = create :programming_class, programming_environment: @programming_environment

    get :edit, params: {id: programming_class.id}
    assert_response :ok

    edit_data = JSON.parse(css_select('script[data-programmingclass]').first.attribute('data-programmingclass').to_s)
    assert_equal programming_class.key, edit_data['key']
    assert_equal programming_class.name, edit_data['name']
  end

  class ProgrammingClassesControllerAccessTests < ActionController::TestCase
    setup do
      File.stubs(:write)
      programming_environment = create :programming_environment
      @programming_class = create :programming_class, programming_environment: programming_environment

      @update_params = {id: @programming_class.id, name: 'new name'}
    end

    test_user_gets_response_for :new, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :new, user: :student, response: :forbidden
    test_user_gets_response_for :new, user: :teacher, response: :forbidden
    test_user_gets_response_for :new, user: :levelbuilder, response: :success

    test_user_gets_response_for :create, params: -> {{name: 'name'}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :create, params: -> {{name: 'name'}}, user: :student, response: :forbidden
    test_user_gets_response_for :create, params: -> {{name: 'name'}}, user: :teacher, response: :forbidden
    test_user_gets_response_for :create, params: -> {{name: 'name'}}, user: :levelbuilder, response: :success

    test_user_gets_response_for :edit, params: -> {{id: @programming_class.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :edit, params: -> {{id: @programming_class.id}}, user: :student, response: :forbidden
    test_user_gets_response_for :edit, params: -> {{id: @programming_class.id}}, user: :teacher, response: :forbidden
    test_user_gets_response_for :edit, params: -> {{id: @programming_class.id}}, user: :levelbuilder, response: :success

    test_user_gets_response_for :update, params: -> {@update_params}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :update, params: -> {@update_params}, user: :student, response: :forbidden
    test_user_gets_response_for :update, params: -> {@update_params}, user: :teacher, response: :forbidden
    test_user_gets_response_for :update, params: -> {@update_params}, user: :levelbuilder, response: :success
  end
end
