module Pd::SurveyPipeline
  class TransformerBase
    def transform_data(*)
      raise 'Must override in derived class'
    end
  end
end
