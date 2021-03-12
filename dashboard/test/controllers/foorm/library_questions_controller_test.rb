require 'test_helper'

module Foorm
  class LibraryQuestionsControllerTest < ActionController::TestCase
    generate_library_question_id = proc do
      library = create :foorm_library, :with_questions
      library_question_id = library.library_questions.first.id

      {id: library_question_id}
    end

    test_user_gets_response_for :show,
      user: :student,
      method: :get,
      params: generate_library_question_id,
      response: :forbidden

    test_user_gets_response_for :update,
      user: :student,
      method: :get,
      params: generate_library_question_id,
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
  end
end
