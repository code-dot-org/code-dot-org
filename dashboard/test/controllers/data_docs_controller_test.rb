require 'test_helper'

class DataDocsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup_all do
    @test_params = {
      key: 'new_doc',
      name: 'New Doc',
      content: 'This doc contains things.'
    }
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
end
