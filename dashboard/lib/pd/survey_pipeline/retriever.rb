module Pd::SurveyPipeline
  class RetrieverBase
    def retrieve_data(*)
      raise 'Must override in derived class'
    end
  end
end
