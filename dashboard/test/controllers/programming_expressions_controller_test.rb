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
      shortDescription: 'short description of code'
    }
    assert_response :ok
    programming_expression.reload

    assert_equal 'new name', programming_expression.name
    assert_equal 'short description of code', programming_expression.short_description
  end
end
