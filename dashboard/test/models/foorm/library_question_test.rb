require 'test_helper'

class Foorm::LibraryQuestionTest < ActiveSupport::TestCase
  test 'other_questions_in_library returns other questions in library with multiple questions' do
    library_questions = create_list(:foorm_library_question, 3, library_name: "LibraryName#{SecureRandom.hex}")

    assert_equal 2,
      library_questions.first.other_questions_in_library.count
  end

  test 'other_questions_in_library returns empty array in library with one question' do
    library_question = create :foorm_library_question

    assert_empty library_question.other_questions_in_library
  end

  test 'library_formatted_as_json returns expected hash for library with multiple questions' do
    library_questions = create_list(:foorm_library_question, 3, library_name: "LibraryName#{SecureRandom.hex}")

    expected = {
      'published' => true,
      'pages' => [
        {
          'elements' => [
            JSON.parse(library_questions.first.question),
            JSON.parse(library_questions.second.question),
            JSON.parse(library_questions.third.question)
          ]
        }
      ]
    }

    assert_equal expected, library_questions.first.library_formatted
  end

  test 'library_formatted_as_json returns expected hash for library with one question' do
    library_question = create :foorm_library_question

    expected = {
      'published' => true,
      'pages' => [
        {
          'elements' => [
            JSON.parse(library_question.question)
          ]
        }
      ]
    }

    assert_equal expected, library_question.library_formatted
  end
end
