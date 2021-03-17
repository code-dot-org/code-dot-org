require 'test_helper'

class Foorm::LibraryQuestionTest < ActiveSupport::TestCase
  test 'updating library question writes to file in levelbuilder mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    # should write to file three times:
    #   - once when creating library,
    #   - again after creating library question,
    #   - and a third time when saving the library question
    File.expects(:write).times(3)

    library = create :foorm_library, :with_questions
    library_question = library.library_questions.first
    library_question.question = JSON.generate({pages: [{elements: [{name: "test"}]}]})
    library_question.save
  end

  test 'updating library question does not write to file in non levelbuilder mode' do
    File.expects(:write).never

    library = create :foorm_library, :with_questions
    library_question = library.library_questions.first
    library_question.question = JSON.generate({pages: [{elements: [{name: "test"}]}]})
    library_question.save
  end

  test 'library question only writes to file on save if it has changed' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.expects(:write).twice

    # should write to file twice (once when creating library, again after creating library question)
    library = create :foorm_library, :with_questions
    # should not write to file, form did not change
    library_question = library.library_questions.first
    library_question.save
  end

  test 'published_forms_appeared_in returns form for library question in published form' do
    library = create :foorm_library, :with_questions
    library_question = library.library_questions.first

    assert_empty library_question.published_forms_appeared_in
    form = create :foorm_form, questions: "{
       \"pages\":[
          {
            \"name\":\"page_1\",
            \"elements\":[
              {
                \"type\": \"library_item\",
                \"library_name\": \"#{library.name}\",
                \"library_version\": #{library.version},
                \"name\": \"#{library.library_questions.first.question_name}\"
              }
            ]
          }
        ]
    }"
    assert_equal Set[form], library_question.published_forms_appeared_in
  end

  test 'published_forms_appeared_in returns empty for library question in unpublished form' do
    library = create :foorm_library, :with_questions
    library_question = library.library_questions.first

    create :foorm_form, published: false, questions: "{
       \"pages\":[
          {
            \"name\":\"page_1\",
            \"elements\":[
              {
                \"type\": \"library_item\",
                \"library_name\": \"#{library.name}\",
                \"library_version\": #{library.version},
                \"name\": \"#{library.library_questions.first.question_name}\"
              }
            ]
          }
        ]
    }"
    assert_empty library_question.published_forms_appeared_in
  end
end
