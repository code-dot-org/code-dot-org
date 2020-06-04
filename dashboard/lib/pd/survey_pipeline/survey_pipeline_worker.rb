module Pd::SurveyPipeline
  class SurveyPipelineWorker
    def self.process_data(*)
      raise 'Must override in derived class'
    end

    def self.check_required_input_keys(required_keys, input)
      missing_keys = required_keys - input.keys
      raise "Missing required input key(s) in #{self}: #{missing_keys}" if
        missing_keys.present?
    end
  end
end
