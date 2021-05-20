require 'test_helper'

module Foorm
  class FormsControllerTest < ActionController::TestCase
    self.use_transactional_test_case = true

    setup_all do
      @levelbuilder = create :levelbuilder
    end

    test_redirect_to_sign_in_for :editor
    test_redirect_to_sign_in_for :create, method: :post
    test_redirect_to_sign_in_for :update_questions, method: :put, params: {id: 1}
    test_redirect_to_sign_in_for :publish, method: :put, params: {id: 1}

    test_user_gets_response_for :editor, user: :student, response: :forbidden
    test_user_gets_response_for :editor, user: :levelbuilder, response: :success
    test_user_gets_response_for :create, user: :student, method: :post, params: {
      name: 'name',
      version: 0,
      questions: {pages: [{elements: [{name: "test"}]}]}
    }, response: :forbidden
    test_user_gets_response_for :create, user: :levelbuilder, method: :post, params: {
      name: 'name',
      version: 0,
      questions: {pages: [{elements: [{name: "test"}]}]}
    }, response: :success
    test_user_gets_response_for :update_questions, user: :student, method: :put, params: {
      id: 1,
      questions: {pages: [{elements: [{name: "test"}]}]}
    }, response: :forbidden
    test_user_gets_response_for :publish, user: :student, method: :put, params: {id: 1}, response: :forbidden

    test 'update succeeds on existing form' do
      sign_in @levelbuilder
      existing_form = create :foorm_form
      put :update_questions, params:  {
        id: existing_form.id,
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

    test 'update fails if published state is changed from true to false' do
      sign_in @levelbuilder
      existing_form = create :foorm_form, published: true
      put :update_questions, params:  {
        id: existing_form.id,
        questions: {published: false, pages: [{elements: [{name: "test"}]}]}
      }
      assert_response :bad_request
    end

    test 'create fails on mismatched published state' do
      sign_in @levelbuilder
      post :create, params:  {
        name: 'name',
        version: 0,
        questions: {published: false, pages: [{elements: [{name: "test"}]}]},
        published: true
      }
      assert_response :bad_request
    end

    test 'can publish a draft form' do
      sign_in @levelbuilder
      form = create :foorm_form, published: false
      put :publish, params: {id: form.id}
      assert_response :success

      form = Foorm::Form.find(form.id)
      assert form.published
      form_questions = JSON.parse(form.questions)
      assert form_questions['published']
    end
  end
end
