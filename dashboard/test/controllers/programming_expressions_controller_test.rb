require 'test_helper'

class ProgrammingExpressionsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder
    @programming_environment = create :programming_environment
  end

  test 'can create programming expression from params' do
    sign_in @levelbuilder
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

    programming_expression = create :programming_expression
    post :update, params: {
      id: programming_expression.id,
      key: programming_expression.key,
      name: 'new name',
      category: 'world',
      shortDescription: 'short description of code',
      externalDocumentation: 'google.com',
      content: 'a longer description of the code',
      syntax: 'block()',
      returnValue: 'none',
      tips: 'some tips on how to use this block',
      parameters: [{name: "id", type: "string", required: true, description: "description"}, {name: "text"}]
    }
    assert_response :ok
    programming_expression.reload

    assert_equal 'new name', programming_expression.name
    assert_equal 'world', programming_expression.category
    assert_equal 'short description of code', programming_expression.short_description
    assert_equal 'google.com', programming_expression.external_documentation
    assert_equal 'a longer description of the code', programming_expression.content
    assert_equal 'block()', programming_expression.syntax
    assert_equal 'none', programming_expression.return_value
    assert_equal 'some tips on how to use this block', programming_expression.tips
    assert_equal [{name: 'id', type: 'string', required: 'true', description: 'description'}, {name: 'text'}].to_json, programming_expression.palette_params.to_json
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

  test 'data is passed down to show page' do
    sign_in @levelbuilder

    programming_expression = create :programming_expression, programming_environment: @programming_environment

    get :show, params: {id: programming_expression.id}
    assert_response :ok

    show_data = css_select('script[data-programmingexpression]').first.attribute('data-programmingexpression').to_s
    assert_equal programming_expression.summarize_for_show.to_json, show_data
  end

  class AccessTests < ActionController::TestCase
    setup do
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
