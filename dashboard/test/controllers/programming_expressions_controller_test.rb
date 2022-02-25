require 'test_helper'

class ProgrammingExpressionsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    File.stubs(:write)
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder
    @programming_environment = create :programming_environment
  end

  test 'can create programming expression from params' do
    sign_in @levelbuilder
    File.expects(:write).with {|filename, _| filename.to_s.end_with? "expression_key.json"}.once
    assert_creates(ProgrammingExpression) do
      post :create, params: {key: 'expression_key', name: 'expression name', programming_environment_id: @programming_environment.id}
    end
  end

  test 'cannot create programming expression with nonexistant programming environment' do
    sign_in @levelbuilder
    destroyed_programming_env_id = @programming_environment.id
    @programming_environment.destroy!
    refute_creates(ProgrammingExpression) do
      post :create, params: {key: 'expression_key', name: 'expression name', programming_environment_id: destroyed_programming_env_id}
    end
    assert @response.body.include? "Valid programming environment is required"
  end

  test 'can update programming expression from params' do
    sign_in @levelbuilder

    programming_expression = create :programming_expression, programming_environment: @programming_environment
    category = create :programming_environment_category, programming_environment: @programming_environment

    File.expects(:write).with {|filename, _| filename.to_s.end_with? "#{programming_expression.key}.json"}.once
    post :update, params: {
      id: programming_expression.id,
      key: programming_expression.key,
      name: 'new name',
      blockName: 'gamelab_location_picker',
      categoryKey: category.key,
      videoKey: 'video-key',
      imageUrl: 'image.code.org/foo',
      shortDescription: 'short description of code',
      externalDocumentation: 'google.com',
      content: 'a longer description of the code',
      syntax: 'block()',
      returnValue: 'none',
      tips: 'some tips on how to use this block',
      parameters: [{name: "id", type: "string", required: true, description: "description"}, {name: "text"}],
      examples: [{name: 'example 1', appEmbedHeight: '300px'}]
    }
    assert_response :ok
    programming_expression.reload

    assert_equal 'new name', programming_expression.name
    assert_equal 'gamelab_location_picker', programming_expression.block_name
    assert_equal category, programming_expression.programming_environment_category
    assert_equal 'video-key', programming_expression.video_key
    assert_equal 'image.code.org/foo', programming_expression.image_url
    assert_equal 'short description of code', programming_expression.short_description
    assert_equal 'google.com', programming_expression.external_documentation
    assert_equal 'a longer description of the code', programming_expression.content
    assert_equal 'block()', programming_expression.syntax
    assert_equal 'none', programming_expression.return_value
    assert_equal 'some tips on how to use this block', programming_expression.tips
    assert_equal [{name: 'id', type: 'string', required: 'true', description: 'description'}, {name: 'text'}].to_json, programming_expression.palette_params.to_json
    assert_equal [{name: 'example 1', appEmbedHeight: '300px'}].to_json, programming_expression.examples.to_json
  end

  test 'data is passed down to edit page' do
    sign_in @levelbuilder

    programming_expression = create :programming_expression, programming_environment: @programming_environment

    get :edit, params: {id: programming_expression.id}
    assert_response :ok

    edit_data = JSON.parse(css_select('script[data-programmingexpression]').first.attribute('data-programmingexpression').to_s)
    assert_equal programming_expression.key, edit_data['key']
    assert_equal programming_expression.name, edit_data['name']
  end

  test 'data is passed down to show page when using id path' do
    sign_in @levelbuilder

    category = create :programming_environment_category, programming_environment: @programming_environment
    programming_expression = create :programming_expression, programming_environment: @programming_environment, programming_environment_category: category

    get :show, params: {id: programming_expression.id}
    assert_response :ok

    show_data = css_select('script[data-programmingexpression]').first.attribute('data-programmingexpression').to_s
    assert_equal programming_expression.summarize_for_show.to_json, show_data

    nav_data = css_select('script[data-categoriesfornavigation]').first.attribute('data-categoriesfornavigation').to_s
    assert_equal 1, JSON.parse(nav_data).length
  end

  test 'data is passed down to show page when using environment and expression path' do
    sign_in @levelbuilder

    category = create :programming_environment_category, programming_environment: @programming_environment
    programming_expression = create :programming_expression, programming_environment: @programming_environment, programming_environment_category: category

    get :show_by_keys, params: {
      programming_environment_name: @programming_environment.name,
      programming_expression_key: programming_expression.key
    }
    assert_response :ok

    show_data = css_select('script[data-programmingexpression]').first.attribute('data-programmingexpression').to_s
    assert_equal programming_expression.summarize_for_show.to_json, show_data

    nav_data = css_select('script[data-categoriesfornavigation]').first.attribute('data-categoriesfornavigation').to_s
    assert_equal 1, JSON.parse(nav_data).length
  end

  class AccessTests < ActionController::TestCase
    setup do
      File.stubs(:write)
      programming_environment = create :programming_environment
      @programming_expression = create :programming_expression, programming_environment: programming_environment

      @update_params = {id: @programming_expression.id, name: 'new name'}
    end

    test_user_gets_response_for :new, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :new, user: :student, response: :forbidden
    test_user_gets_response_for :new, user: :teacher, response: :forbidden
    test_user_gets_response_for :new, user: :levelbuilder, response: :success

    test_user_gets_response_for :create, params: -> {{name: 'name'}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :create, params: -> {{name: 'name'}}, user: :student, response: :forbidden
    test_user_gets_response_for :create, params: -> {{name: 'name'}}, user: :teacher, response: :forbidden
    test_user_gets_response_for :create, params: -> {{name: 'name'}}, user: :levelbuilder, response: :success

    test_user_gets_response_for :edit, params: -> {{id: @programming_expression.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :edit, params: -> {{id: @programming_expression.id}}, user: :student, response: :forbidden
    test_user_gets_response_for :edit, params: -> {{id: @programming_expression.id}}, user: :teacher, response: :forbidden
    test_user_gets_response_for :edit, params: -> {{id: @programming_expression.id}}, user: :levelbuilder, response: :success

    test_user_gets_response_for :update, params: -> {{id: @programming_expression.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :update, params: -> {@update_params}, user: :student, response: :forbidden
    test_user_gets_response_for :update, params: -> {@update_params}, user: :teacher, response: :forbidden
    test_user_gets_response_for :update, params: -> {@update_params}, user: :levelbuilder, response: :success

    test_user_gets_response_for :show, params: -> {{id: @programming_expression.id}}, user: nil, response: :success
    test_user_gets_response_for :show, params: -> {{id: @programming_expression.id}}, user: :student, response: :success
    test_user_gets_response_for :show, params: -> {{id: @programming_expression.id}}, user: :teacher, response: :success
    test_user_gets_response_for :show, params: -> {{id: @programming_expression.id}}, user: :levelbuilder, response: :success
  end
end
