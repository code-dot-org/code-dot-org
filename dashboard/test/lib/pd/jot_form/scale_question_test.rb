require 'test_helper'
require 'pd/jot_form/scale_question'

module Pd
  module JotForm
    class ScaleQuestionTest < ActiveSupport::TestCase
      include Constants

      test 'parse jotform question data for scale' do
        jotform_question = {
          qid: '1',
          type: TYPE_SCALE,
          name: 'sampleScale',
          text: 'This is a scale label',
          order: '1',
          scaleFrom: '1',
          scaleAmount: '5',
          fromText: 'Strongly Agree',
          toText: 'Strongly Disagree'
        }.stringify_keys

        question = ScaleQuestion.from_jotform_question jotform_question
        assert question.is_a? ScaleQuestion
        assert_equal 1, question.id
        assert_equal TYPE_SCALE, question.type
        assert_equal 'sampleScale', question.name
        assert_equal 'This is a scale label', question.text
        assert_equal 1, question.order
        assert_equal ANSWER_SCALE, question.answer_type
        assert_equal [1, 2, 3, 4, 5], question.values
        assert_equal ['Strongly Agree', 'Strongly Disagree'], question.options
      end

      test 'get_value' do
        question = ScaleQuestion.new(id: 1, values: (1..5).to_a)

        assert_equal 3, question.get_value('3')
        e = assert_raises do
          question.get_value '0'
        end
        assert_equal "Unrecognized answer 0 for question 1 (Range: 1..5)", e.message
      end

      test 'to hash and back' do
        hash = {
          id: 1,
          type: TYPE_SCALE,
          name: 'a name',
          text: 'label',
          order: 1,
          options: %w(From To),
          values: [1, 2, 3]
        }

        question = ScaleQuestion.new(hash)
        assert_equal hash, question.to_h
      end

      test 'summarize' do
        question = ScaleQuestion.new(
          id: 1,
          name: 'sampleScale',
          text: 'a label',
          values: (1..5).to_a,
          options: %w(From To)
        )

        expected_summary = {
          'sampleScale' => {
            text: 'a label',
            answer_type: ANSWER_SCALE,
            min_value: 1,
            max_value: 5,
            options: ['1 - From', '2', '3', '4', '5 - To']
          }
        }
        assert_equal expected_summary, question.summarize
      end
    end
  end
end
