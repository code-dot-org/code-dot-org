require 'test_helper'

module Foorm
  class LibraryQuestionsControllerTest < ActionController::TestCase
    setup_all do
      @levelbuilder = create :levelbuilder

      @library = create :foorm_library, :with_questions
      puts "library question: #{@library.library_questions.first.id}"
      @library_question_id = @library.library_questions.first.id
    end

    test 'test test' do
      # this passes if you specify the correct ID in params
      Foorm::LibraryQuestionsControllerTest.test_user_gets_response_for :show,
        user: :student,
        method: :get,
        params: {id: @library_question_id},
        response: :forbidden

      # need to figure out why these don't work
      Foorm::LibraryQuestionsControllerTest.test_user_gets_response_for :update,
        user: :student,
        method: :put,
        params: {id: @library_question_id},
        response: :forbidden
    end

    test 'update succeeds on existing library' do
      puts "#{@library_question_id} in update succeeds test"

      sign_in @levelbuilder

      put :update, params: {
        id: @library_question_id,
        question: {pages: [{elements: [{name: "test"}]}]}
      }

      assert_response :success
    end
  end
end
