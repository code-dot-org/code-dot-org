module Pd::SurveyPipeline
  class SurveyPipelineWorker
    def self.process_data(*)
      raise 'Must override in derived class'
    end
  end
end
