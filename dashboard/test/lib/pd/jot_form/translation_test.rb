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
        assert_nil Translation.get_question_class_for(TYPE_HEADING)
        assert_nil Translation.get_question_class_for(TYPE_BUTTON)

        assert_equal TextQuestion, Translation.get_question_class_for(TYPE_TEXTBOX)
        assert_equal TextQuestion, Translation.get_question_class_for(TYPE_TEXTAREA)
        assert_equal TextQuestion, Translation.get_question_class_for(TYPE_NUMBER)

        assert_equal SelectQuestion, Translation.get_question_class_for(TYPE_DROPDOWN)
        assert_equal SelectQuestion, Translation.get_question_class_for(TYPE_RADIO)
        assert_equal SelectQuestion, Translation.get_question_class_for(TYPE_CHECKBOX)

        assert_equal ScaleQuestion, Translation.get_question_class_for(TYPE_SCALE)
        assert_equal MatrixQuestion, Translation.get_question_class_for(TYPE_MATRIX)

        IGNORED_QUESTION_TYPES.each do |ignored_type|
          assert_nil Translation.get_question_class_for(ignored_type)
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
          }.stringify_keys

          mock_class = mock
          mock_class.expects(:from_jotform_question).
            with(id: id, type: type, jotform_question: content[id]).
            returns(mock)

          Translation.expects(:get_question_class_for).with(type).returns(mock_class)
        end

        Translation.expects(:get_question_class_for).with('ignored').returns(nil)
        content[100] = {
          qid: 100,
          type: 'control_ignored'
        }.stringify_keys

        JotFormRestClient.any_instance.expects(:get_questions).with(@form_id).returns(
          {
            content: content
          }.stringify_keys
        )

        questions = Translation.new(@form_id).get_questions

        assert_equal 8, QUESTION_TYPES.length
        assert_equal 8, questions.length
      end

      test 'get_submission queries the client and transforms the submission data' do
        last_known_submission_id = 100

        JotFormRestClient.any_instance.
          expects(:get_submissions).
          with(@form_id, last_known_submission_id: last_known_submission_id).
          returns(get_submissions_result)

        result = Translation.new(@form_id).get_submissions(last_known_submission_id: last_known_submission_id)
        expected_result = [
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

        assert_equal expected_result, result
      end

      protected

      def get_submissions_result
        {
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
                }
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
