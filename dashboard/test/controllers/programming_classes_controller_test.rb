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
    assert_includes(@response.body, "Valid programming environment is required")
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

  test 'can create programming methods when updating programming class' do
    sign_in @levelbuilder
    File.expects(:write).once

    programming_class = create :programming_class, programming_environment: @programming_environment
    category = create :programming_environment_category, programming_environment: @programming_environment

    post :update, params: {
      id: programming_class.id,
      key: programming_class.key,
      name: 'new name',
      categoryKey: category.key,
      fields: [{name: 'field 1', type: 'int'}],
      methods: [{name: 'method1'}, {name: 'method2', description: 'description'}]
    }
    assert_response :ok
    programming_class.reload

    assert_equal 'new name', programming_class.name
    assert_equal category, programming_class.programming_environment_category
    assert_equal 2, programming_class.programming_methods.count
  end

  test 'can update and destroy programming methods when updating programming class' do
    sign_in @levelbuilder
    File.expects(:write).once

    programming_class = create :programming_class, programming_environment: @programming_environment
    category = create :programming_environment_category, programming_environment: @programming_environment
    method_to_update = create :programming_method, programming_class: programming_class
    method_to_destroy = create :programming_method, programming_class: programming_class

    post :update, params: {
      id: programming_class.id,
      key: programming_class.key,
      name: 'new name',
      categoryKey: category.key,
      fields: [{name: 'field 1', type: 'int'}],
      methods: [{id: method_to_update.id, name: 'updated name'}]
    }
    assert_response :ok
    programming_class.reload

    assert_equal 'new name', programming_class.name
    assert_equal category, programming_class.programming_environment_category
    assert_equal 1, programming_class.programming_methods.count
    assert_equal 'updated name', programming_class.programming_methods.first.name
    assert_nil ProgrammingMethod.find_by_id(method_to_destroy.id)
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
      @programming_environment = create :programming_environment
      @programming_class = create :programming_class, programming_environment: @programming_environment
      @unpublished_programming_environment = create :programming_environment, published: false
      @unpublished_programming_class = create :programming_class, programming_environment: @unpublished_programming_environment

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

    test_user_gets_response_for :show, params: -> {{id: @programming_class.id}}, user: nil, response: :success
    test_user_gets_response_for :show, params: -> {{id: @programming_class.id}}, user: :student, response: :success
    test_user_gets_response_for :show, params: -> {{id: @programming_class.id}}, user: :teacher, response: :success
    test_user_gets_response_for :show, params: -> {{id: @programming_class.id}}, user: :levelbuilder, response: :success

    test_user_gets_response_for :show, params: -> {{id: @unpublished_programming_class.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in', name: 'test_signed_out_calling_get_show_for_unpublished_class_should_receive_redirect'
    test_user_gets_response_for :show, params: -> {{id: @unpublished_programming_class.id}}, user: :student, response: :forbidden, name: 'test_student_calling_get_show_for_unpublished_class_should_receive_forbidden'
    test_user_gets_response_for :show, params: -> {{id: @unpublished_programming_class.id}}, user: :teacher, response: :forbidden, name: 'test_teacher_calling_get_show_for_unpublished_class_should_receive_forbidden'
    test_user_gets_response_for :show, params: -> {{id: @unpublished_programming_class.id}}, user: :levelbuilder, response: :success, name: 'test_levelbuilder_calling_get_show_for_unpublished_class_should_receive_success'

    test_user_gets_response_for :show_by_keys, params: -> {{programming_environment_name: @programming_environment.name, programming_class_key: @programming_class.key}}, user: nil, response: :success
    test_user_gets_response_for :show_by_keys, params: -> {{programming_environment_name: @programming_environment.name, programming_class_key: @programming_class.key}}, user: :student, response: :success
    test_user_gets_response_for :show_by_keys, params: -> {{programming_environment_name: @programming_environment.name, programming_class_key: @programming_class.key}}, user: :teacher, response: :success
    test_user_gets_response_for :show_by_keys, params: -> {{programming_environment_name: @programming_environment.name, programming_class_key: @programming_class.key}}, user: :levelbuilder, response: :success

    test_user_gets_response_for :show_by_keys, params: -> {{programming_environment_name: @unpublished_programming_environment.name, programming_class_key: @unpublished_programming_class.key}}, user: nil, response: :forbidden, name: 'test_signed_out_calling_get_show_by_keys_for_unpublished_class_should_be_forbidden'
    test_user_gets_response_for :show_by_keys, params: -> {{programming_environment_name: @unpublished_programming_environment.name, programming_class_key: @unpublished_programming_class.key}}, user: :student, response: :forbidden, name: 'test_student_calling_get_show_by_keys_for_unpublished_class_should_be_forbidden'
    test_user_gets_response_for :show_by_keys, params: -> {{programming_environment_name: @unpublished_programming_environment.name, programming_class_key: @unpublished_programming_class.key}}, user: :teacher, response: :forbidden, name: 'test_teacher_calling_get_show_by_keys_for_unpublished_class_should_be_forbidden'
    test_user_gets_response_for :show_by_keys, params: -> {{programming_environment_name: @unpublished_programming_environment.name, programming_class_key: @unpublished_programming_class.key}}, user: :levelbuilder, response: :success, name: 'test_levelbuilder_calling_get_show_by_keys_for_unpublished_class_should_receive_success'
  end

  class FilterTests < ActionController::TestCase
    setup do
      ProgrammingEnvironment.all.destroy_all
      @programming_environment1 = create :programming_environment
      @programming_environment2 = create :programming_environment
      [@programming_environment1, @programming_environment2].each do |programming_environment|
        3.times do
          category = create :programming_environment_category, programming_environment: programming_environment
          4.times do
            create :programming_class, programming_environment: programming_environment, programming_environment_category: category
          end
        end
      end

      @levelbuilder = create :levelbuilder
    end

    test 'get_filtered_results returns not_acceptable if no page providewd' do
      sign_in @levelbuilder

      get :get_filtered_results, params: {}
      assert_response :not_acceptable
    end

    test 'get_filtered_results returns paged results' do
      sign_in @levelbuilder

      get :get_filtered_results, params: {page: 1}
      assert_response :ok
      response = JSON.parse(@response.body)
      assert_equal 2, response['numPages']
      assert_equal 20, response['results'].length

      get :get_filtered_results, params: {page: 2}
      assert_response :ok
      response = JSON.parse(@response.body)
      assert_equal 2, response['numPages']
      assert_equal 4, response['results'].length
    end

    test 'get_filtered_results only returns expressions in environment if specified' do
      sign_in @levelbuilder

      get :get_filtered_results, params: {programmingEnvironmentId: @programming_environment1.id, page: 1}
      assert_response :ok
      response = JSON.parse(@response.body)
      assert_equal 1, response['numPages']
      assert_equal 12, response['results'].length
    end

    test 'get_filtered_results only returns expressions in category if specified' do
      sign_in @levelbuilder

      get :get_filtered_results, params: {programmingEnvironmentId: @programming_environment2.id, categoryId: @programming_environment2.categories.first.id, page: 1}
      assert_response :ok
      response = JSON.parse(@response.body)
      assert_equal 1, response['numPages']
      assert_equal 4, response['results'].length
    end
  end
end
