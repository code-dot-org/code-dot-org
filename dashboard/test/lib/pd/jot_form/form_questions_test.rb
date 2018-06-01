require 'test_helper'
require 'pd/jot_form/form_questions'

module Pd
  module JotForm
    class FormQuestionsTest < ActiveSupport::TestCase
      include Constants

      setup do
        @form_id = 123
        @questions = [
          TextQuestion.new(
            id: 1,
            name: 'text',
            text: 'text label'
          ),
          SelectQuestion.new(
            id: 2,
            type: TYPE_RADIO,
            name: 'singleSelect',
            text: 'single select label',
            options: %w(One Two Three)
          ),
          SelectQuestion.new(
            id: 3,
            name: 'singleSelectWithOther',
            type: TYPE_RADIO,
            text: 'single select with other label',
            options: %w(One Two Three),
            allow_other: true,
            other_text: 'Other'
          ),
          SelectQuestion.new(
            id: 4,
            type: TYPE_CHECKBOX,
            name: 'multiSelect',
            text: 'multi select label',
            options: %w(One Two Three)
          ),
          SelectQuestion.new(
            id: 5,
            type: TYPE_CHECKBOX,
            name: 'multiSelectWithOther',
            text: 'multi select with other label',
            options: %w(One Two Three),
            allow_other: true,
            other_text: 'Other'
          ),
          ScaleQuestion.new(
            id: 6,
            name: 'scale',
            text: 'scale label',
            options: %w(From To),
            values: [1, 2, 3]
          ),
          MatrixQuestion.new(
            id: 7,
            name: 'matrix',
            text: 'How much do you agree or disagree with the following statements about this workshop?',
            options: %w(Disagree Neutral Agree),
            sub_questions: [
              'I learned something',
              'It was a good use of time',
              'I enjoyed it'
            ]
          ),
          TextQuestion.new(
            id: 8,
            name: 'hidden_text',
            text: 'This should be hidden',
            hidden: true
          )
        ]

        @form_questions = FormQuestions.new(@form_id, @questions)

        @jotform_answers = {
          '1' => 'this is my text answer',
          '2' => 'Two',
          '3' => {'other' => 'my other reason'},
          '4' => %w(Two Three),
          '5' => {'0' => 'Two', 'other' => 'my other reason'},
          '6' => '2',
          '7' => {
            'I learned something' => 'Agree',
            'It was a good use of time' => 'Neutral',
            'I enjoyed it' => 'Agree'
          },
          '8' => 'hidden answer'
        }
      end

      test 'summarize' do
        expected_summary = {
          'text' => {
            text: 'text label',
            answer_type: ANSWER_TEXT
          },
          'singleSelect' => {
            text: 'single select label',
            answer_type: ANSWER_SELECT_VALUE,
            max_value: 3
          },
          'singleSelectWithOther' => {
            text: 'single select with other label',
            answer_type: ANSWER_SELECT_TEXT
          },
          'multiSelect' => {
            text: 'multi select label',
            answer_type: ANSWER_MULTI_SELECT
          },
          'multiSelectWithOther' => {
            text: 'multi select with other label',
            answer_type: ANSWER_MULTI_SELECT
          },
          'scale' => {
            text: 'scale label',
            answer_type: ANSWER_SELECT_VALUE,
            max_value: 3
          },
          'matrix' => {
            text: 'How much do you agree or disagree with the following statements about this workshop?',
            answer_type: ANSWER_NONE
          },
          'matrix_0' => {
            text: 'I learned something',
            answer_type: ANSWER_SELECT_VALUE,
            parent: 'matrix',
            max_value: 3
          },
          'matrix_1' => {
            text: 'It was a good use of time',
            answer_type: ANSWER_SELECT_VALUE,
            parent: 'matrix',
            max_value: 3
          },
          'matrix_2' => {
            text: 'I enjoyed it',
            answer_type: ANSWER_SELECT_VALUE,
            parent: 'matrix',
            max_value: 3
          }
        }

        assert_equal expected_summary, @form_questions.summarize
      end

      test 'process_answers' do
        expected_processed_answers = {
          'text' => 'this is my text answer',
          'singleSelect' => 2,
          'singleSelectWithOther' => 'my other reason',
          'multiSelect' => %w(Two Three),
          'multiSelectWithOther' => ['Two', 'my other reason'],
          'scale' => 2,
          'matrix_0' => 3,
          'matrix_1' => 2,
          'matrix_2' => 3
        }

        assert_equal expected_processed_answers, @form_questions.process_answers(@jotform_answers)
      end

      test 'show hidden questions' do
        answers_with_hidden = @form_questions.process_answers(@jotform_answers, show_hidden_questions: true)
        assert answers_with_hidden.key? 'hidden_text'

        summary_with_hidden = @form_questions.summarize(show_hidden_questions: true)
        assert summary_with_hidden.key? 'hidden_text'
      end

      test 'serialize' do
        @questions.each {|q| q.expects(:to_h).returns({id: q.id})}
        serialized = @form_questions.serialize

        assert serialized.is_a? Array
        assert_equal @questions.length, serialized.length
        @questions.each_with_index do |q, i|
          assert_equal q.id, serialized[i][:id]
        end
      end

      test 'deserialize' do
        fake_questions_array = 5.times.map do |i|
          {type: "fake type #{i}"}
        end

        # Each question hash is passed to the constructor of the appropriate Question sub-class,
        # and then the array of Questions are passed to the FormQuestions constructor
        mock_constructed_questions = 5.times.map {mock}
        5.times do |i|
          mock_question_class = mock do |c|
            c.expects(:new).with({type: "fake type #{i}"}).returns(mock_constructed_questions[i])
          end

          Translation.expects(:get_question_class_for).with("fake type #{i}").returns(mock_question_class)
        end
        FormQuestions.expects(:new).with(@form_id, mock_constructed_questions)

        FormQuestions.deserialize(@form_id, fake_questions_array)
      end
    end
  end
end
