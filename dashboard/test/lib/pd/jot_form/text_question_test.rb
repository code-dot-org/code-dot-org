require 'test_helper'
require 'pd/jot_form/text_question'

module Pd
  module JotForm
    class TextQuestionTest < ActiveSupport::TestCase
      include Constants

      [TYPE_TEXTBOX, TYPE_TEXTAREA].each_with_index do |type, id|
        test "parse jotform question data for #{type}" do
          name = "sample#{type.camelize}"
          text = "This is a #{type} label"

          jotform_question = {
            qid: id,
            type: type,
            name: name,
            text: text,
            order: '1'
          }.stringify_keys

          question = TextQuestion.from_jotform_question jotform_question
          assert question.is_a? TextQuestion
          assert_equal id, question.id
          assert_equal type, question.type
          assert_equal name, question.name
          assert_equal text, question.text
          assert_equal 1, question.order
          assert_equal ANSWER_TEXT, question.answer_type
        end
      end

      test 'get_value returns raw text answer' do
        value = TextQuestion.new({}).get_value('This is my answer')
        assert_equal 'This is my answer', value
      end

      test 'to hash and back' do
        hash = {
          id: 1,
          type: TYPE_TEXTBOX,
          name: 'a name',
          text: 'label',
          order: 1
        }

        question = TextQuestion.new(hash)
        assert_equal hash, question.to_h
      end
    end
  end
end
