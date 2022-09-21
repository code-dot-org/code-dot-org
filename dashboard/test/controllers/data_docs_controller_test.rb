require 'test_helper'

class DataDocsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup_all do
    @levelbuilder = create :levelbuilder

    @data_doc_key = 'new_doc'.freeze
    @test_params = {
      key: @data_doc_key,
      name: 'New Doc',
      content: 'This doc contains things.'
    }.freeze

    @data_doc = create :data_doc, key: @data_doc_key
  end

  # new page is levelbuilder only
  test_user_gets_response_for :new, user: nil, response: :redirect
  test_user_gets_response_for :new, user: :student, response: :forbidden
  test_user_gets_response_for :new, user: :teacher, response: :forbidden
  test_user_gets_response_for :new, user: :levelbuilder, response: :success

  # only levelbuilder can create
  test_user_gets_response_for :create, params: -> {@test_params}, user: nil, response: :redirect
  test_user_gets_response_for :create, params: -> {@test_params}, user: :student, response: :forbidden
  test_user_gets_response_for :create, params: -> {@test_params}, user: :teacher, response: :forbidden
  test_user_gets_response_for :create, params: -> {@test_params}, user: :levelbuilder, response: :success

  test_user_gets_response_for :show, params: -> {{key: @data_doc_key}}, user: nil, response: :success
  test_user_gets_response_for :show, params: -> {{key: @data_doc_key}}, user: :student, response: :success
  test_user_gets_response_for :show, params: -> {{key: @data_doc_key}}, user: :teacher, response: :success
  test_user_gets_response_for :show, params: -> {{key: @data_doc_key}}, user: :levelbuilder, response: :success

  test 'creating a new data doc redirects to show page with key in URL' do
    sign_in @levelbuilder
    new_key = 'doc_key'
    get :create, params: {key: new_key}
    assert_redirected_to action: 'show', key: new_key
  end

  test 'show page renders 404 when data doc is not found' do
    get :show, params: {key: 'unknown_key'}
    assert_response :not_found
  end

  test 'data doc is updated through update route' do
    sign_in @levelbuilder
    new_key = 'doc_key'
    editable_data_doc = create :data_doc, {key: new_key, name: 'Doc name', content: 'Doc content.'}

    get :edit, params: {key: new_key}
    edited_name = 'New doct name'
    edited_content = 'New doc content.'
    post :update, params: {
      key: new_key,
      name: edited_name,
      content: edited_content
    }
    assert_response :ok

    editable_data_doc.reload
    assert_equal new_key, editable_data_doc.key
    assert_equal edited_name, editable_data_doc.name
    assert_equal edited_content, editable_data_doc.content
  end

  test 'edit page renders 404 when data doc is not found' do
    sign_in @levelbuilder
    get :edit, params: {key: 'unknown_key'}
    assert_response :not_found
  end
end
