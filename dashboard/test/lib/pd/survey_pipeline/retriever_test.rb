require 'test_helper'
require 'pd/survey_pipeline/retriever.rb'

module Pd::SurveyPipeline
  class DailySurveyRetrieverTest < ActiveSupport::TestCase
    setup_all do
      # TODO: seed data into db

      # create survey question
      # create ws daily survey
      # create ws facilitator daily survey

      # TODO: remove logger in test and real code
      log_file = File.new("#{File.dirname(__FILE__)}/log_retriever.txt", 'w')
      log_file.sync = true
      @logger = Logger.new(log_file, level: Logger::DEBUG)
    end

    test 'can retrieve all data if no filter' do
      res = Pd::SurveyPipeline::DailySurveyRetriever.new.retrieve_data logger: @logger

      assert res.dig(:survey_questions)
      assert res.dig(:workshop_daily_surveys)
      assert res.dig(:facilitator_daily_surveys)
    end

    test 'can retrieve data using workshop Id filter' do
      skip 'TODO'
    end

    test 'can retrieve data using form Id filter' do
      skip 'TODO'
    end

    test 'can retrieve data using both workshop Id and form Id filters' do
      skip 'TODO'
    end
  end
end
