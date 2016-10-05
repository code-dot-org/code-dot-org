require 'test_helper'
require 'controllers/api/v1/pd/workshop_score_summarizer'
require_relative "#{Rails.root}/../pegasus/forms/pd_workshop_survey"

class Api::V1::Pd::WorkshopScoreSummarizerTest < ActiveSupport::TestCase
  include WorkshopScoreSummarizer

  setup do
    # One teacher loved the workshop - they gave the best possible answer to each question
    happy_teacher_question_responses = {}
    [
      WorkshopScoreSummarizer::FACILITATOR_EFFECTIVENESS_QUESTIONS,
      WorkshopScoreSummarizer::TEACHER_ENGAGEMENT_QUESTIONS,
    ].flatten.each do |question|
      happy_teacher_question_responses[question] = get_best_response_for_question(question, PdWorkshopSurvey::OPTIONS)
    end

    OVERALL_SUCCESS_QUESTIONS.each do |question|
      happy_teacher_question_responses[question] = PdWorkshopSurvey::AGREE_SCALE_OPTIONS.last
    end

    happy_teacher_response = {}
    happy_teacher_response[:data] = happy_teacher_question_responses.to_json
    @some_dumb_object = {}
    PEGASUS_DB.stubs(:[]).returns(@some_dumb_object)
    @some_dumb_object.stubs(:where).returns([happy_teacher_response])

    @workshop = create(:pd_workshop)
    create(:pd_enrollment, workshop: @workshop)
    @workshops = [@workshop]
  end

  test 'one happy teacher' do
    expected_results = {
        number_teachers: 1,
        response_count: 1,
        facilitator_effectiveness: 5,
        teacher_engagement: 5,
        overall_success: 6
    }

    assert_equal expected_results, get_score_for_workshops(@workshops)
  end

  private

  def get_best_response_for_question(question, answers)
    WorkshopScoreSummarizer::INVERTED_RESPONSE_QUESTIONS.include?(question) ? answers[question].first : answers[question].last
  end
end
