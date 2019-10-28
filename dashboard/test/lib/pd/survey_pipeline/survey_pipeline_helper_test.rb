require 'test_helper'

module Pd::SurveyPipeline
  class SurveyPipelineHelperTest < ActiveSupport::TestCase
    include Pd::SurveyPipeline::Helper

    # include Pd::SurveyPipeline::Helper

    setup_all do
      @admin = create :workshop_admin

      # Create workshop and facilitator surveys (shared among tests)
      questions = [
        {id: 1, type: "number", name: "question1", text: "Enter a number"},
        {id: 2, type: "dropdown", name: "question2", text: "Select an option", options: ["Option 1", "Option 2"]},
        {id: 3, type: "textarea", name: "question3", text: "Write something"},
        {
          id: 4, type: "matrix", name: "question4", text: "Select options for sub questions",
          sub_questions: ["Sub question 1", "Sub question 2"], options: ["Option 1", "Option 2"]
        }
      ]
      create :pd_survey_question, form_id: TEST_PRE, questions: questions.to_json
      create :pd_survey_question, form_id: TEST_FAC, questions: questions.to_json
    end

    test 'report_single_workshop for workshop without submissions' do
      ws = create :csf_deep_dive_workshop

      expected_report = {
        course_name: ws.course,
        questions: {},
        this_workshop: {},
        errors: []
      }

      # Execute pipeline
      report = report_single_workshop(ws, @admin)
      assert_equal expected_report, report
    end

    test 'report_single_workshop for workshop with submissions' do
      # Set context = CSF workshop
      ws = create :csf_deep_dive_workshop

      # Create workshop submissions
      answers = {
        1 => "7",
        2 => "Option 1",
        3 => "I love CS",
        4 => {"Sub question 1": "Option 1", "Sub question 2": "Option 2"}
      }

      3.times do
        create :pd_workshop_daily_survey,
          form_id: TEST_PRE,
          pd_workshop: ws,
          day: 0,
          answers: answers.to_json
      end

      # Create facilitator submissions
      f = ws.facilitators.first
      3.times do
        create :pd_workshop_facilitator_daily_survey,
          form_id: TEST_FAC,
          day: 1,
          pd_session: ws.sessions.first,
          facilitator: f,
          answers: answers.to_json
      end

      # set expected result
      expected_question_format = {
        "question1" => {
          type: "number",
          text: "Enter a number",
          answer_type: "text"
        },
        "question2" => {
          type: "dropdown",
          text: "Select an option",
          options: [
            "Option 1",
            "Option 2"
          ],
          option_map: {
            "Option 1" => 1,
            "Option 2" => 2
          },
          answer_type: "singleSelect"
        },
        "question3" => {
          type: "textarea",
          text: "Write something",
          answer_type: "text"
        },
        "question4_772935676727648907" => {
          type: "radio",
          text: "Select options for sub questions -> Sub question 1",
          options: [
            "Option 1",
            "Option 2"
          ],
          option_map: {
            "Option 1" => 1,
            "Option 2" => 2
          },
          answer_type: "singleSelect",
          max_value: 2,
          parent: "question4"
        },
        "question4_17034857631694847574" => {
          type: "radio",
          text: "Select options for sub questions -> Sub question 2",
          options: [
            "Option 1",
            "Option 2"
          ],
          option_map: {
            "Option 1" => 1,
            "Option 2" => 2
          },
          answer_type: "singleSelect",
          max_value: 2,
          parent: "question4"
        }
      }

      expected_answers = {
        "question1" => %w(7 7 7),
        "question2" => {"Option 1" => 3},
        "question3" => ["I love CS", "I love CS", "I love CS"],
        "question4_772935676727648907" => {"Option 1" => 3},
        "question4_17034857631694847574" => {"Option 2" => 3}
      }

      expected_report = {
        course_name: ws.course,
        questions: {
          "Pre Workshop" => {general: expected_question_format, facilitator: {}},
          "Facilitators" => {general: {}, facilitator: expected_question_format}
        },
        this_workshop: {
          "Pre Workshop" => {
            response_count: 3,
            general: expected_answers,
            facilitator: {}
          },
          "Facilitators" => {
            response_count: 3,
            general: {},
            facilitator: {
              "question1" => {f.name => %w(7 7 7)},
              "question2" => {f.name => {"Option 1" => 3}},
              "question3" => {f.name => ["I love CS", "I love CS", "I love CS"]},
              "question4_772935676727648907" => {f.name => {"Option 1" => 3}},
              "question4_17034857631694847574" => {f.name => {"Option 2" => 3}}
            }
          }
        },
        errors: []
      }

      # Execute pipeline
      report = report_single_workshop(ws, @admin)
      assert_equal expected_report, report
    end

    TEST_FORM_IDS = [
      TEST_PRE = 1,
      TEST_POST = 2,
      TEST_FAC = 3,
    ]

    # create collection of questions and default answers (agnostic of forms)
    # create survey form by compiling questions
    # Create workshop/facilitator submission using default answers
  end
end
