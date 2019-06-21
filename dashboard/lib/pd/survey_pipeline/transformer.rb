module Pd::SurveyPipeline
  class TransformerBase
    def self.transform_data(*)
      raise 'Must override in derived class'
    end
  end
end
