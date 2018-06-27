require 'test_helper'

class MultiLevelTest < ActiveSupport::TestCase
  test 'parses question text when text field' do
    level = Multi.create(name: "__q1", level_num: "custom", type: 'Multi',
      properties: {'questions': [{'text': 'Question text'}]}
    )
    assert_equal(level.get_question_text, 'Question text')
  end

  test 'parses question text when markdown field' do
    level = Multi.create(name: "__q1", level_num: "custom", type: 'Multi',
      properties: {'markdown': 'Question text'}
    )
    assert_equal(level.get_question_text, 'Question text')
  end

  test 'correct_answer_indexes_array gets an array of integers' do
    level = Multi.create(name: "__q1", level_num: "custom", type: 'Multi',
      properties: {'answers': [
        {"text" => "answer 1", "correct" => false},
        {"text" => "answer 2", "correct" => true},
        {"text" => "answer 2", "correct" => true},
      ]}
    )
    assert_equal(level.correct_answer_indexes_array, [1, 2])
  end
end
