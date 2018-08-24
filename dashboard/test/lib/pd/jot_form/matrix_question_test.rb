require 'test_helper'
require 'pd/jot_form/matrix_question'

module Pd
  module JotForm
    class MatrixQuestionTest < ActiveSupport::TestCase
      include Constants

      test 'parse jotform question data for matrix' do
        jotform_question = {
          qid: '1',
          type: TYPE_MATRIX,
          name: 'sampleMatrix',
          text: 'This is a matrix label',
          order: '1',
          mcolumns: 'Strongly Agree|Agree|Neutral|Disagree|Strongly Disagree',
          mrows: 'Question 1|Question 2'
        }.stringify_keys

        question = MatrixQuestion.from_jotform_question jotform_question
        assert question.is_a? MatrixQuestion
        assert_equal 1, question.id
        assert_equal TYPE_MATRIX, question.type
        assert_equal 'sampleMatrix', question.name
        assert_equal 'This is a matrix label', question.text
        assert_equal 1, question.order
        assert_equal ANSWER_SINGLE_SELECT, question.answer_type
        assert_equal ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'], question.options
        assert_equal ['Question 1', 'Question 2'], question.sub_questions
      end

      test 'get_value' do
        question = MatrixQuestion.new(
          id: 1,
          options: %w(Agree Neutral Disagree),
          sub_questions: ['Question 1', 'Question 2', 'Question 3']
        )

        answer = {
          'Question 1' => 'Neutral',
          'Question 2' => '', # blank answer should be ignored
          'Question 3' => 'Agree'
        }

        assert_equal(
          {0 => 'Neutral', 2 => 'Agree'},
          question.get_value(answer)
        )
      end

      test 'get_value errors' do
        question = MatrixQuestion.new(
          id: 1,
          options: %w(Agree Neutral Disagree),
          sub_questions: ['Question 1']
        )

        e = assert_raises do
          question.get_value({'Nonexistent Question' => 'Agree'})
        end
        assert_equal "Unable to find sub-question 'Nonexistent Question' in matrix question 1", e.message

        e = assert_raises do
          question.get_value('Question 1' => 'Nonexistent Answer')
        end
        assert_equal "Unable to find 'Nonexistent Answer' in the options for matrix question 1", e.message
      end

      test 'summarize' do
        question = MatrixQuestion.new(
          id: 1,
          name: 'sampleMatrix',
          text: 'How much do you agree or disagree with the following statements about this workshop?',
          options: %w(Disagree Neutral Agree),
          sub_questions: [
            'I learned something',
            'It was a good use of time'
          ]
        )

        expected_summary = {
          'sampleMatrix_0' => {
            text: 'How much do you agree or disagree with the following statements about this workshop? I learned something',
            answer_type: ANSWER_SINGLE_SELECT,
            options: %w(Disagree Neutral Agree),
            parent: 'sampleMatrix',
            max_value: 3
          },
          'sampleMatrix_1' => {
            text: 'How much do you agree or disagree with the following statements about this workshop? It was a good use of time',
            answer_type: ANSWER_SINGLE_SELECT,
            options: %w(Disagree Neutral Agree),
            parent: 'sampleMatrix',
            max_value: 3
          }
        }

        assert_equal expected_summary, question.summarize
      end

      test 'process_answer' do
        question = MatrixQuestion.new(
          id: 1,
          name: 'sampleMatrix',
          options: %w(Disagree Neutral Agree),
          sub_questions: [
            'I learned something',
            'It was a good use of time'
          ],
        )

        answer = {
          'I learned something' => 'Agree',
          'It was a good use of time' => 'Neutral'
        }

        assert_equal(
          {
            'sampleMatrix_0' => 'Agree',
            'sampleMatrix_1' => 'Neutral'
          },
          question.process_answer(answer)
        )
      end

      test 'to hash and back' do
        hash = {
          id: 1,
          type: TYPE_MATRIX,
          name: 'a name',
          text: 'label',
          order: 1,
          options: %w(One Two Three),
          sub_questions: ['Question 1', 'Question 2']
        }

        question = MatrixQuestion.new(hash)
        assert_equal hash, question.to_h
      end
    end
  end
end
