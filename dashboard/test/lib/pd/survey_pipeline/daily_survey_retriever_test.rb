require 'test_helper'
require 'pd/survey_pipeline/daily_survey_retriever.rb'

module Pd::SurveyPipeline
  class DailySurveyRetrieverTest < ActiveSupport::TestCase
    include Pd::WorkshopConstants

    self.use_transactional_test_case = true

    setup_all do
      @workshop_form_ids = [11_000_000_000_000, 11_000_000_000_001]
      @facilitator_form_ids = [22_000_000_000_000, 22_000_000_000_001]
      @workshops = create_list :csf_deep_dive_workshop, 2, num_sessions: 2

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

    test 'raise if missing input key' do
      context = {}

      exception = assert_raises RuntimeError do
        DailySurveyRetriever.process_data context
      end

      assert exception.message.start_with?('Missing required input key')
    end

    test 'can retrieve all data if no filter' do
      context = {filters: {}}
      DailySurveyRetriever.process_data context

      assert_equal @workshop_submissions.length, context[:workshop_submissions]&.length
      assert_equal @facilitator_submissions.length, context[:facilitator_submissions]&.length
      assert_equal @survey_questions.length, context[:survey_questions]&.length
    end

    test 'can retrieve data using workshop id filter' do
      context = {filters: {workshop_ids: @workshops.first.id}}
      DailySurveyRetriever.process_data context

      assert_equal @workshop_submissions.length / @workshops.length,
        context[:workshop_submissions]&.length
      assert_equal @facilitator_submissions.length / @workshops.length,
        context[:facilitator_submissions]&.length
      assert_equal @workshop_form_ids.length + @facilitator_form_ids.length,
        context[:survey_questions]&.length
    end

    test 'can retrieve data using form id filter' do
      context = {filters: {form_ids: @workshop_form_ids.first}}
      DailySurveyRetriever.process_data context

      assert_equal @workshop_submissions.length / @workshop_form_ids.length,
        context[:workshop_submissions]&.length
      assert_equal 0, context[:facilitator_submissions]&.length
      assert_equal 1, context[:survey_questions]&.length
    end

    test 'can retrieve data using both workshop id and form id filters' do
      context = {filters: {workshop_ids: @workshops.first.id, form_ids: @facilitator_form_ids.first}}
      DailySurveyRetriever.process_data context

      assert_equal 0, context[:workshop_submissions]&.length
      assert_equal @facilitator_submissions.size / (@workshops.length * @facilitator_form_ids.size),
        context[:facilitator_submissions]&.length
      assert_equal 1, context[:survey_questions]&.length
    end

    test 'return empty if workshop does not have submission' do
      # Use non-existence workshop id as filter
      context = {filters: {workshop_ids: @workshops.pluck(:id).max + 1}}
      DailySurveyRetriever.process_data context

      assert_equal 0, context[:workshop_submissions]&.length
      assert_equal 0, context[:facilitator_submissions]&.length
      assert_equal 0, context[:survey_questions]&.length
    end

    test 'return empty if form does not have submission' do
      # Use non-existence form id as filter
      context = {filters: {form_ids: @workshop_form_ids.max + 1}}
      DailySurveyRetriever.process_data context

      assert_equal 0, context[:workshop_submissions]&.length
      assert_equal 0, context[:facilitator_submissions]&.length
      assert_equal 0, context[:survey_questions]&.length
    end
  end
end
