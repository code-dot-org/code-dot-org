require 'test_helper'

class Foorm::LibraryTest < ActiveSupport::TestCase
  test 'library_formatted_as_json returns expected hash for library with multiple questions' do
    library = create :foorm_library, :with_questions, number_of_questions: 3

    expected = JSON.pretty_generate(
      {
        'published' => true,
        'pages' => [
          {
            'elements' => [
              JSON.parse(library.library_questions.first.question),
              JSON.parse(library.library_questions.second.question),
              JSON.parse(library.library_questions.third.question)
            ]
          }
        ]
      }
    )

    assert_equal expected, library.formatted_for_file
  end
end
