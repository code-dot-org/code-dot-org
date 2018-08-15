require 'test_helper'
require 'pd/jot_form/select_question'

module Pd
  module JotForm
    class SelectQuestionTest < ActiveSupport::TestCase
      include Constants

      {
        TYPE_DROPDOWN => ANSWER_SINGLE_SELECT,
        TYPE_RADIO => ANSWER_SINGLE_SELECT,
        TYPE_CHECKBOX => ANSWER_MULTI_SELECT
      }.each do |type, expected_answer_type|
        test "parse jotform question data for #{type}" do
          name = "sample#{type.camelize}"
          text = "This is a #{type} label"

          jotform_question = {
            qid: '1',
            type: type,
            name: name,
            text: text,
            order: '1',
            options: 'Option 1|Option 2|Option 3',
            allowOther: 'No'
          }.stringify_keys

          question = SelectQuestion.from_jotform_question jotform_question

          assert question.is_a? SelectQuestion
          assert_equal 1, question.id
          assert_equal type, question.type
          assert_equal expected_answer_type, question.answer_type
          assert_equal name, question.name
          assert_equal text, question.text
          assert_equal 1, question.order
          assert_equal ['Option 1', 'Option 2', 'Option 3'], question.options
          refute question.allow_other
        end
      end

      test 'get_value for single selection returns the single value' do
        question = SelectQuestion.new(id: 1, type: TYPE_RADIO, options: %w(First Second Third))

        assert_equal 'First', question.get_value('First')
        assert_equal 'Second', question.get_value('Second')
        assert_equal 'Third', question.get_value('Third')

        e = assert_raises do
          question.get_value('Invalid')
        end
        assert_equal "Unrecognized answer 'Invalid' for question 1 (Options: First,Second,Third)", e.message
      end

      test 'get_value for multiple selections returns the raw answer arrays' do
        question = SelectQuestion.new(id: 1, type: TYPE_CHECKBOX, options: %w(First Second Third))

        assert_equal %w(First), question.get_value(%w(First))
        assert_equal %w(Second Third), question.get_value(%w(Second Third))
      end

      test 'get_value with other' do
        question = SelectQuestion.new(
          id: 1,
          type: TYPE_RADIO,
          options: %w(First Second Third),
          allow_other: true,
          other_text: 'Placeholder'
        )

        assert_equal 'my other text', question.get_value({'other' => 'my other text'})
        assert_equal 'Placeholder', question.get_value({'other' => ''})

        question.type = TYPE_CHECKBOX
        assert_equal ['First', 'my other text'], question.get_value({'0' => 'First', 'other' => 'my other text'})
      end

      test 'to hash and back' do
        hash = {
          id: 1,
          type: TYPE_RADIO,
          name: 'a name',
          text: 'label',
          order: 1,
          options: %w(One Two Three),
          allow_other: true,
          other_text: 'Other'
        }

        question = SelectQuestion.new(hash)
        assert_equal hash, question.to_h
      end

      test 'summarize' do
        question = SelectQuestion.new(
          id: 1,
          type: TYPE_RADIO,
          name: 'sampleSelect',
          text: 'a label',
          options: %w(One Two Three)
        )

        expected_summary = {
          'sampleSelect' => {
            text: 'a label',
            answer_type: ANSWER_SINGLE_SELECT,
            options: %w(One Two Three),
            other_text: nil
          }
        }
        assert_equal expected_summary, question.summarize
      end

      test 'summarize_with_other' do
        question = SelectQuestion.new(
          id: 1,
          type: TYPE_RADIO,
          name: 'sampleSelectWithOther',
          text: 'pick one',
          options: %w(A B C),
          other_text: 'Other',
          allow_other: true
        )

        expected_summary = {
          'sampleSelectWithOther' => {
            text: 'pick one',
            answer_type: ANSWER_SINGLE_SELECT,
            options: %w(A B C),
            other_text: 'Other'
          }
        }

        assert_equal expected_summary, question.summarize
      end
    end
  end
end
