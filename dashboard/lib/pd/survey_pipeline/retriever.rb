module Pd::SurveyPipeline
  class RetrieverBase
    def self.retrieve_data(*)
      raise 'Must override in derived class'
    end
  end
end
