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

  # TODO [meg] : all should be able to see `show` page, once launched
  # for now, only levelbuilder can see it
  test_user_gets_response_for :show, params: -> {{key: @data_doc_key}}, user: nil, response: :redirect
  test_user_gets_response_for :show, params: -> {{key: @data_doc_key}}, user: :student, response: :forbidden
  test_user_gets_response_for :show, params: -> {{key: @data_doc_key}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :show, params: -> {{key: @data_doc_key}}, user: :levelbuilder, response: :success

  test 'show page renders 404 when data doc is not found' do
    sign_in @levelbuilder
    get :show, params: {key: 'unknown_key'}
    assert_response :not_found
  end
end
