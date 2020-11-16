require 'test_helper'

module Foorm
  class FormsControllerTest < ActionController::TestCase
    self.use_transactional_test_case = true

    setup_all do
      @levelbuilder = create :levelbuilder
    end

    test_redirect_to_sign_in_for :create, method: :post, params: {name: 'name', version: 0}
    test_redirect_to_sign_in_for :update, method: :put, params: {name: 'name', version: 0}
    test_user_gets_response_for :create, user: :student, method: :post, params: {name: 'name', version: 0}, response: :forbidden
    test_user_gets_response_for :create, user: :levelbuilder, method: :post, params: {
      name: 'name',
      version: 0,
      questions: {pages: [{elements: [{name: "test"}]}]}
    }, response: :success
    test_user_gets_response_for :update, user: :student, method: :post, params: {name: 'name', version: 0}, response: :forbidden

    test 'update fails if form does not exist' do
      sign_in @levelbuilder
      post :update, params:  {
        name: 'nonexistent_form_name',
        version: 0,
        questions: {pages: [{elements: [{name: "test"}]}]}
      }
      assert_response 500
    end

    test 'update succeeds on existing form' do
      sign_in @levelbuilder
      existing_form = create :foorm_form
      post :update, params:  {
        name: existing_form.name,
        version: existing_form.version,
        questions: {pages: [{elements: [{name: "test"}]}]}
      }
      assert_response :success
    end

    test 'create fails on existing form' do
      sign_in @levelbuilder
      existing_form = create :foorm_form
      post :create, params:  {
        name: existing_form.name,
        version: existing_form.version,
        questions: {pages: [{elements: [{name: "test"}]}]}
      }
      assert_response 409
    end
  end
end
