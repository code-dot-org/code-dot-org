require 'test_helper'
require 'pd/survey_pipeline/retriever.rb'

module Pd::SurveyPipeline
  class DailySurveyRetrieverTest < ActiveSupport::TestCase
    include Pd::WorkshopConstants

    setup_all do
      @form_ids = [11_000_000_000_000, 11_000_000_000_001]
      @facilitator_form_ids = [22_000_000_000_000, 22_000_000_000_001]
      @workshops = create_list :pd_workshop, 2,
        course: COURSE_CSF, subject: SUBJECT_CSF_201, num_sessions: 2

      teachers = create_list :teacher, 2
      facilitators = create_list :facilitator, 2
      days = [0, 1]

      # Create workshop daily surveys
      @workshop_surveys = @workshops.product(teachers, days, @form_ids).each do |ws, teacher, day, form|
        create :pd_workshop_daily_survey, pd_workshop: ws, user: teacher, day: day, form_id: form
      end

      # Create facilitator daily surveys
      combinations = @workshops.product(teachers, days, @facilitator_form_ids, facilitators)

      @facilitator_surveys = combinations.each do |ws, teacher, day, form, facilitator|
        create :pd_workshop_facilitator_daily_survey, pd_workshop: ws, user: teacher,
          day: day, form_id: form, pd_session: ws.sessions[day], facilitator: facilitator
      end

      # Create survey questions
      @survey_questions = (@form_ids + @facilitator_form_ids).each do |form|
        create :pd_survey_question, form_id: form
      end

      # TODO: remove logger in test and real code
      @logger = nil
      if CDO.use_log_file_in_test
        log_file = File.new("#{File.dirname(__FILE__)}/log_retriever.txt", 'w')
        log_file.sync = true
        @logger = Logger.new(log_file, level: Logger::DEBUG)
      end
    end

    test 'can retrieve all data if no filter' do
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new

      res = retriever.retrieve_data logger: @logger

      assert_equal @workshop_surveys.length, res.dig(:workshop_surveys)&.length
      assert_equal @facilitator_surveys.length, res.dig(:facilitator_surveys)&.length
      assert_equal @survey_questions.length, res.dig(:survey_questions)&.length
    end

    test 'can retrieve data using workshop id filter' do
      filter = {workshop_ids: @workshops.first.id}
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new filter

      res = retriever.retrieve_data logger: @logger

      assert_equal @workshop_surveys.length / @workshops.length,
        res.dig(:workshop_surveys)&.length
      assert_equal @facilitator_surveys.length / @workshops.length,
        res.dig(:facilitator_surveys)&.length
      assert_equal @form_ids.length + @facilitator_form_ids.length,
        res.dig(:survey_questions)&.length
    end

    test 'can retrieve data using form id filter' do
      filter = {form_ids: @form_ids.first}
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new filter

      res = retriever.retrieve_data logger: @logger

      assert_equal @workshop_surveys.length / @form_ids.length,
        res.dig(:workshop_surveys)&.length
      assert_equal 0, res.dig(:facilitator_surveys)&.length
      assert_equal 1, res.dig(:survey_questions)&.length
    end

    test 'can retrieve data using both workshop id and form id filters' do
      filter = {workshop_ids: @workshops.first.id, form_ids: @facilitator_form_ids.first}
      retriever = Pd::SurveyPipeline::DailySurveyRetriever.new filter

      res = retriever.retrieve_data logger: @logger

      assert_equal 0, res.dig(:workshop_surveys)&.length
      assert_equal @facilitator_surveys.length / (@workshops.length * @facilitator_form_ids.length),
        res.dig(:facilitator_surveys)&.length
      assert_equal 1, res.dig(:survey_questions)&.length
    end
  end
end
