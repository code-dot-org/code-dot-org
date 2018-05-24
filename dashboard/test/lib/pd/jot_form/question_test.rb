require 'test_helper'
require 'pd/jot_form/question'

module Pd
  module JotForm
    class QuestionTest < ActiveSupport::TestCase
      include Constants

      test 'unsupported type' do
        e = assert_raises do
          Question.new(type: 'unsupported')
        end
        assert_equal 'Invalid type unsupported for Pd::JotForm::Question', e.message
      end

      test 'summarize' do
        question = Question.new(
          name: 'sampleQuestion',
          text: 'This is a sample label'
        )
        question.stubs(:answer_type).returns(ANSWER_TEXT)

        assert_equal(
          {'sampleQuestion' => {text: 'This is a sample label', answer_type: 'text'}},
          question.summarize
        )
      end

      test 'process_answer' do
        question = Question.new(name: 'sampleQuestion')
        mock_answer = mock
        mock_value = mock
        question.expects(:get_value).with(mock_answer).returns(mock_value)

        assert_equal(
          {'sampleQuestion' => mock_value},
          question.process_answer(mock_answer)
        )
      end
    end
  end
end
