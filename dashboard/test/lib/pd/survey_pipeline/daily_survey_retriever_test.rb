require 'test_helper'
require 'pd/survey_pipeline/daily_survey_retriever.rb'

module Pd::SurveyPipeline
  class DailySurveyRetrieverTest < ActiveSupport::TestCase
    include Pd::WorkshopConstants

    self.use_transactional_test_case = true

    setup_all do
      @workshop_form_ids = [11_000_000_000_000, 11_000_000_000_001]
      @facilitator_form_ids = [22_000_000_000_000, 22_000_000_000_001]
      @workshops = create_list :pd_workshop, 2,
        course: COURSE_CSF, subject: SUBJECT_CSF_201, num_sessions: 2

      teachers = create_list :teacher, 2
      facilitators = create_list :facilitator, 2
      days = [0, 1]

      # Create workshop daily surveys
      ws_combinations = @workshops.product(teachers, days, @workshop_form_ids)
      @workshop_submissions = ws_combinations.each do |ws, teacher, day, form|
        create :pd_workshop_daily_survey, pd_workshop: ws, user: teacher, day: day, form_id: form
      end

      # Create facilitator daily surveys
      f_combinations = @workshops.product(teachers, days, @facilitator_form_ids, facilitators)
      @facilitator_submissions = f_combinations.each do |ws, teacher, day, form, facilitator|
        create :pd_workshop_facilitator_daily_survey, pd_workshop: ws, user: teacher,
          day: day, form_id: form, pd_session: ws.sessions[day], facilitator: facilitator
      end

      # Create survey questions
      @survey_questions = (@workshop_form_ids + @facilitator_form_ids).each do |form|
        create :pd_survey_question, form_id: form
      end
    end

    test 'can retrieve all data if no filter' do
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new

      result = retriever.retrieve_data

      assert_equal @workshop_submissions.length, result[:workshop_submissions]&.length
      assert_equal @facilitator_submissions.length, result[:facilitator_submissions]&.length
      assert_equal @survey_questions.length, result[:survey_questions]&.length
    end

    test 'can retrieve data using workshop id filter' do
      filter = {workshop_ids: @workshops.first.id}
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new filter

      result = retriever.retrieve_data

      assert_equal @workshop_submissions.length / @workshops.length,
        result[:workshop_submissions]&.length
      assert_equal @facilitator_submissions.length / @workshops.length,
        result[:facilitator_submissions]&.length
      assert_equal @workshop_form_ids.length + @facilitator_form_ids.length,
        result[:survey_questions]&.length
    end

    test 'can retrieve data using form id filter' do
      filter = {form_ids: @workshop_form_ids.first}
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new filter

      result = retriever.retrieve_data

      assert_equal @workshop_submissions.length / @workshop_form_ids.length,
        result[:workshop_submissions]&.length
      assert_equal 0, result[:facilitator_submissions]&.length
      assert_equal 1, result[:survey_questions]&.length
    end

    test 'can retrieve data using both workshop id and form id filters' do
      filter = {workshop_ids: @workshops.first.id, form_ids: @facilitator_form_ids.first}
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new filter

      result = retriever.retrieve_data

      assert_equal 0, result[:workshop_submissions]&.length
      assert_equal @facilitator_submissions.size / (@workshops.length * @facilitator_form_ids.size),
        result[:facilitator_submissions]&.length
      assert_equal 1, result[:survey_questions]&.length
    end

    test 'return empty if workshop does not have submission' do
      # Use non-existence workshop id as filter
      filter = {workshop_ids: @workshops.pluck(:id).max + 1}
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new filter

      result = retriever.retrieve_data

      assert_equal 0, result[:workshop_submissions]&.length
      assert_equal 0, result[:facilitator_submissions]&.length
      assert_equal 0, result[:survey_questions]&.length
    end

    test 'return empty if form does not have submission' do
      # Use non-existence form id as filter
      filter = {form_ids: @workshop_form_ids.max + 1}
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new filter

      result = retriever.retrieve_data

      assert_equal 0, result[:workshop_submissions]&.length
      assert_equal 0, result[:facilitator_submissions]&.length
      assert_equal 0, result[:survey_questions]&.length
    end
  end
end
