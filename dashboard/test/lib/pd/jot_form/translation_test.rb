require 'test_helper'
require 'pd/jot_form/translation'
require 'pd/jot_form/constants'

module Pd
  module JotForm
    class TranslationTest < ActiveSupport::TestCase
      include Constants

      setup do
        CDO.stubs(:jotform_api_key).returns('fake-jotform-API-key')
        @form_id = 99
      end

      test 'question classes by type' do
        assert_equal TextQuestion, Translation.get_question_class_for(TYPE_TEXTBOX)
        assert_equal TextQuestion, Translation.get_question_class_for(TYPE_TEXTAREA)
        assert_equal TextQuestion, Translation.get_question_class_for(TYPE_NUMBER)

        assert_equal SelectQuestion, Translation.get_question_class_for(TYPE_DROPDOWN)
        assert_equal SelectQuestion, Translation.get_question_class_for(TYPE_RADIO)
        assert_equal SelectQuestion, Translation.get_question_class_for(TYPE_CHECKBOX)

        assert_equal ScaleQuestion, Translation.get_question_class_for(TYPE_SCALE)
        assert_equal MatrixQuestion, Translation.get_question_class_for(TYPE_MATRIX)

        IGNORED_QUESTION_TYPES.each do |ignored_type|
          e = assert_raises do
            Translation.get_question_class_for(ignored_type)
          end
          assert_equal "Unexpected question type: #{ignored_type}", e.message
        end
      end

      test 'unexpected question type error' do
        e = assert_raises do
          Translation.get_question_class_for 'nonexistent'
        end
        assert_equal 'Unexpected question type: nonexistent', e.message
      end

      test 'get_questions queries the client and constructs appropriate question classes' do
        content = {}

        QUESTION_TYPES.each_with_index do |type, i|
          id = i + 1
          content[id] = {
            qid: id,
            type: "control_#{type}",
            name: "testQuestion#{i}",
            text: "test #{type} question"
          }.stringify_keys
          sanitized_content = content[id].merge('type' => type)

          mock_class = mock
          mock_class.expects(:from_jotform_question).with(sanitized_content).returns(mock)
          Translation.expects(:get_question_class_for).with(type).returns(mock_class)
        end

        content[100] = {
          qid: 100,
          type: 'control_button',
          name: 'ignored',
          text: 'this should be ignored'
        }.stringify_keys
        Translation.expects(:get_question_class_for).with('button').never

        JotFormRestClient.any_instance.expects(:get_questions).with(@form_id).returns(
          {
            content: content
          }.stringify_keys
        )

        questions = Translation.new(@form_id).get_questions

        assert_equal 8, QUESTION_TYPES.length
        assert_equal 8, questions.length
      end

      test 'get_questions replaces -summary text' do
        JotFormRestClient.any_instance.expects(:get_questions).with(@form_id).returns(
          {
            content: {
              1 => {
                qid: 1,
                type: 'control_text',
                name: 'formattedLabel1',
                text: 'This is formatted text displayed in the form to describe the following question',
                order: 1
              },
              2 => {
                qid: 2,
                type: 'control_scale',
                name: 'scale1',
                text: 'to be overwritten',
                order: 2
              },
              3 => {
                qid: 3,
                type: 'control_text',
                name: 'scale1-summary',
                text: 'This is the summary for scale1'
              }
            }
          }.deep_stringify_keys
        )

        questions = Translation.new(@form_id).get_questions
        assert_equal 1, questions.length
        assert_equal 2, questions.first.id
        assert_equal 'scale1', questions.first.name
        assert_equal 'This is the summary for scale1', questions.first.text
      end

      test 'get_submission queries the client and transforms the submission data' do
        last_known_submission_id = 100

        JotFormRestClient.any_instance.
          expects(:get_submissions).
          with(@form_id, last_known_submission_id: last_known_submission_id, min_date: nil, limit: 100, offset: 0).
          returns(get_submissions_result)

        result = Translation.new(@form_id).get_submissions(last_known_submission_id: last_known_submission_id)
        expected_result = {
          result_set: {
            offset: 0,
            limit: 100,
            count: 2
          },
          submissions:
          [
            {
              form_id: @form_id,
              submission_id: 101,
              answers: {
                1 => 'answer1.1',
                2 => 'answer2.1'
              }
            },
            {
              form_id: @form_id,
              submission_id: 102,
              answers: {
                1 => 'answer1.2',
                2 => 'answer2.2'
              }
            }
          ]
        }

        assert_equal expected_result, result
      end

      test 'strip_answer' do
        translation = Translation.new(@form_id)
        assert_equal(
          'text answer',
          translation.send(:strip_answer, '  text answer  ')
        )
        assert_equal(
          %w(one two),
          translation.send(:strip_answer, ['  one  ', '  two  '])
        )
        assert_equal(
          {1 => 'one', 2 => 'two'},
          translation.send(:strip_answer, {1 => '  one  ', 2 => '  two  '})
        )
      end

      protected

      def get_submissions_result
        {
          resultSet: {
            offset: 0,
            limit: 100,
            count: 2
          },
          content: [
            {
              id: '101',
              answers: {
                '1' => {
                  name: 'name1',
                  text: 'label1',
                  type: 'control_textbox',
                  answer: 'answer1.1'
                },
                '2' => {
                  name: 'name2',
                  text: 'label2',
                  type: 'control_radio',
                  answer: 'answer2.1'
                },
                '3' => {
                  name: 'text1',
                  text: 'this text field should be ignored',
                  type: 'control_text'
                },
                '4' => {
                  name: 'unexplainedFalseAnswer',
                  text: 'this should also be ignored',
                  type: 'control_matrix',
                  answer: false
                },
                '5' => {
                  name: 'unexplainedNullAnswer',
                  text: 'this should also be ignored',
                  type: 'control_matrix',
                  answer: nil
                },
                '6' => {
                  name: 'emptyAnswer',
                  text: 'this should also be ignored',
                  type: 'control_matrix',
                  answer: ''
                },
              }
            },
            {
              id: '102',
              answers: {
                '1' => {
                  name: 'name1',
                  text: 'label1',
                  type: 'control_textbox',
                  answer: 'answer1.2'
                },
                '2' => {
                  name: 'name2',
                  text: 'label2',
                  type: 'control_radio',
                  answer: 'answer2.2'
                }
              }
            }
          ]
        }.deep_stringify_keys
      end
    end
  end
end
