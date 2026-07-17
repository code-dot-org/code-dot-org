require 'test_helper'

class QuizTest < ActiveSupport::TestCase
  test 'summarize_for_lab2_properties builds SurveyJS pages grouped and ordered correctly' do
    quiz = create(:quiz, name: 'quiz_test')
    q1 = create(:quiz_question, question_type: 'radiogroup', survey_element: {'title' => 'Q1', 'choices' => [], 'correctAnswer' => 'A'})
    q2 = create(:quiz_question, question_type: 'radiogroup', survey_element: {'title' => 'Q2', 'choices' => [], 'correctAnswer' => 'B'})
    q3 = create(:quiz_question, question_type: 'radiogroup', survey_element: {'title' => 'Q3', 'choices' => [], 'correctAnswer' => 'C'})

    # Deliberately created out of order, to confirm the summary sorts by
    # (page_number, position) rather than relying on insertion order.
    create(:quiz_level_question, level: quiz, quiz_question: q2, page_number: 0, position: 1)
    create(:quiz_level_question, level: quiz, quiz_question: q1, page_number: 0, position: 0)
    create(:quiz_level_question, level: quiz, quiz_question: q3, page_number: 1, position: 0)

    script = create(:script, :in_single_unit_course)
    summary = quiz.summarize_for_lab2_properties(script, nil, nil)
    pages = summary[:surveyJson][:pages]

    assert_equal script.id, summary[:scriptId]
    assert_equal 2, pages.length
    assert_equal ["q_#{q1.id}", "q_#{q2.id}"], (pages[0][:elements].map {|e| e['name']})

    element = pages[1][:elements][0]
    assert_equal "q_#{q3.id}", element['name']
    assert_equal 'radiogroup', element['type']
    assert_equal 'Q3', element['title']
    assert_equal 'C', element['correctAnswer']
  end
end
