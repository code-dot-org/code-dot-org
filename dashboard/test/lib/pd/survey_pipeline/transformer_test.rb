require 'test_helper'
require 'pd/survey_pipeline/transformer.rb'

module Pd::SurveyPipeline
  class DailySurveyParserTest < ActiveSupport::TestCase
    include Pd::WorkshopConstants

    self.use_transactional_test_case = true

    setup_all do
      ws_form_id = 11_000_000_000_000
      facilitator_form_id = 22_000_000_000_000

      ws = create :pd_workshop, course: COURSE_CSF, subject: SUBJECT_CSF_201, num_sessions: 1
      teacher = create :teacher
      facilitator = create :facilitator
      day = 0

      # TODO: add matrix question
      @ws_survey = create :pd_survey_question, form_id: ws_form_id,
        questions: '[' +
          '{"id": 1, "type": "number", "name": "overall", "text": "Overall rating"},' +
          '{"id": 2, "type": "dropdown", "name": "theCs", "text": "Select a CS Principles lesson", "options": ["Lesson 1","Lesson 2","Lesson 3"]},'+
          '{"id": 3, "type": "textarea", "name": "optionalPlease", "text": "Describe something"}' +
          ']'

      @total_question_count = JSON.parse(@ws_survey.questions).size

      @ws_submission = create :pd_workshop_daily_survey,
        form_id: ws_form_id, pd_workshop: ws, user: teacher, day: day,
        answers: '{"1":"4.5", "2":"Lesson 2", "3":"Like it"}'

      @total_answer_count = JSON.parse(@ws_submission.answers).size

      # TODO: add these
      # facilitator_survey = create :pd_survey_question, form_id: ws_form_id,
      #   questions: "[{}{}{}]"
      # facilitator_submission = create :pd_workshop_facilitator_daily_survey,
      #   form_id: facilitator_form_id, pd_workshop: ws, user: teacher, day: day,
      #   pd_session: ws.sessions[day], facilitator: facilitator,
      #   answers: "{}"
    end


    test 'can parse basic question and submission' do
      # TODO: create individual question parsing test & submission parsing test
      # This is more integration test of multiple functions
      result = DailySurveyParser.new.transform_data(
        survey_questions: [@ws_survey],
        workshop_submissions: [@ws_submission],
        facilitator_submissions: []
      )

      assert_equal @total_question_count, result[:questions]&.size
      assert_equal @total_answer_count, result[:submissions]&.size
    end

    test 'can parse matrix question' do
      q = {
        id: 62,
        type: "matrix",
        name: "rightNow147",
        text: "Right now, how are things going with the {workshopCourse} curriculum?",
        order: 20,
        options: ["Strongly Disagree", "Disagree", "Slightly Disagree", "Neutral", "Slightly Agree", "Agree", "Strongly Agree"],
        sub_questions: [
          "I love teaching with this curriculum.",
          "I completely understand the objectives of, and intention behind, the curriculum.",
          "I completely understand the teaching strategies I am supposed to use in the curriculum."
          ]
      }

      results = DailySurveyParser.new.parse_matrix_question(q)
      results.each { |res| p res.inspect }

      assert_equal q[:sub_questions].size, results.size
    end

    # Test Join transformer
    # Can join. Cannot join.
    # Test Matrix transformer
    # Selected type + Transformable type is transformed
    # Selected type but not transformable type is not transformed
    # Not selected type is not transformed
    # Transformable types has function to transform them
  end
end
