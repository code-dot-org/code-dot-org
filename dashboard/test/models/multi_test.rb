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
end
