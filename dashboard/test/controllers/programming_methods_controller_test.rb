require 'test_helper'

class ProgrammingMethodsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    File.stubs(:write)
    FileUtils.stubs(:mkdir_p)
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder
    @programming_class = create :programming_class
  end

  test 'can update programming method from params' do
    sign_in @levelbuilder
    File.expects(:write).once

    programming_method = create :programming_method, programming_class: @programming_class

    post :update, params: {
      id: programming_method.id,
      key: programming_method.key,
      name: 'new name',
      content: 'a longer description of the code',
      syntax: 'new Class()',
      examples: [{name: 'example 1', embed_app_with_code_height: '300px'}]
    }
    assert_response :ok
    programming_method.reload

    assert_equal 'new name', programming_method.name
    assert_equal 'a longer description of the code', programming_method.content
    assert_equal 'new Class()', programming_method.syntax
    assert_equal [{name: 'example 1', embed_app_with_code_height: '300px'}].to_json, programming_method.examples
  end

  test 'data is passed down to edit page' do
    sign_in @levelbuilder

    programming_method = create :programming_method, programming_class: @programming_class

    get :edit, params: {id: programming_method.id}
    assert_response :ok

    edit_data = JSON.parse(css_select('script[data-programmingmethod]').first.attribute('data-programmingmethod').to_s)
    assert_equal programming_method.key, edit_data['key']
    assert_equal programming_method.name, edit_data['name']
  end

  class ProgrammingMethodsControllerAccessTests < ActionController::TestCase
    setup do
      File.stubs(:write)
      programming_class = create :programming_class
      @programming_method = create :programming_method, programming_class: programming_class

      @update_params = {id: @programming_method.id, name: 'new name'}
    end

    test_user_gets_response_for :edit, params: -> {{id: @programming_method.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :edit, params: -> {{id: @programming_method.id}}, user: :student, response: :forbidden
    test_user_gets_response_for :edit, params: -> {{id: @programming_method.id}}, user: :teacher, response: :forbidden
    test_user_gets_response_for :edit, params: -> {{id: @programming_method.id}}, user: :levelbuilder, response: :success

    test_user_gets_response_for :update, params: -> {@update_params}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
    test_user_gets_response_for :update, params: -> {@update_params}, user: :student, response: :forbidden
    test_user_gets_response_for :update, params: -> {@update_params}, user: :teacher, response: :forbidden
    test_user_gets_response_for :update, params: -> {@update_params}, user: :levelbuilder, response: :success
  end
end
