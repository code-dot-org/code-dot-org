require 'test_helper'

module Foorm
  class LibraryQuestionsControllerTest < ActionController::TestCase
    generate_library_question = proc do
      library = create :foorm_library, :with_questions
      library_question = library.library_questions.first

      # Question required as parameter to pass before_action on :update and :create actions
      {
        id: library_question.id,
        question: library_question.question
      }
    end

    test_user_gets_response_for :show,
      user: :student,
      method: :get,
      params: generate_library_question,
      response: :forbidden

    test_user_gets_response_for :update,
      user: :student,
      method: :get,
      params: generate_library_question,
      response: :forbidden

    test_user_gets_response_for :create,
      user: :student,
      method: :post,
      params: generate_library_question,
      response: :forbidden

    test 'update succeeds on existing library' do
      library = create :foorm_library, :with_questions
      library_question_id = library.library_questions.first.id

      levelbuilder = create :levelbuilder
      sign_in levelbuilder

      put :update, params: {
        id: library_question_id,
        question: {pages: [{elements: [{name: "test"}]}]}
      }

      assert_response :success
    end

    test 'create succeeds for new library question in existing library' do
      levelbuilder = create :levelbuilder
      sign_in levelbuilder

      library = create :foorm_library

      post :create, params: {
        library_id: library.id,
        question: {pages: [{elements: [{name: "test"}]}]},
        name: 'test_question_name'
      }

      # Timestamp format is different if you do not as_json ActiveRecord objects
      assert_equal Hash(
        library_question: Foorm::LibraryQuestion.where(question_name: 'test_question_name').first.as_json,
        library: library.as_json
      ).as_json, JSON.parse(response.body)
    end

    test 'create succeeds for new library question in new library' do
      levelbuilder = create :levelbuilder
      sign_in levelbuilder

      post :create, params: {
        library_name: 'test_library_name',
        question: {pages: [{elements: [{name: "test"}]}]},
        name: 'test_question_name'
      }

      assert_equal Hash(
        library_question: Foorm::LibraryQuestion.find_by(question_name: 'test_question_name').as_json,
        library: Foorm::Library.find_by(name: 'test_library_name').as_json
      ).as_json, JSON.parse(response.body)
    end

    test 'create fails if no library name and no library ID provided' do
      levelbuilder = create :levelbuilder
      sign_in levelbuilder

      post :create, params: {
        question: {pages: [{elements: [{name: "test"}]}]},
        name: 'test_question_name'
      }

      assert_includes JSON.parse(response.body)['library'], 'must exist'
    end

    test 'create fails if no library question name provided' do
      levelbuilder = create :levelbuilder
      sign_in levelbuilder

      library = create :foorm_library

      post :create, params: {
        library_id: library.id,
        question: {pages: [{elements: [{name: "test"}]}]}
      }

      assert_includes JSON.parse(response.body)['question_name'], 'is required'
    end
  end
end
