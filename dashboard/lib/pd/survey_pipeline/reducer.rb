module Pd::SurveyPipeline
  class ReducerBase
    def name(*)
      raise 'Must override in derived class'
    end

    def reduce(*)
      raise 'Must override in derived class'
    end
  end

  class AvgReducer < ReducerBase
    def self.name
      'average'
    end

    # @param values Array<string> array of numbers in string format
    # @return [float] average of the input values
    def self.reduce(values)
      return unless values.is_a? Array
      values.inject(0.0) {|sum, elem| sum + elem.to_f} / values.size
    end
  end

  class HistogramReducer < ReducerBase
    def self.name
      'histogram'
    end

    # @param values Array<string> array of strings
    # @return [Hash{string => number}] count number of occurences of each string
    def self.reduce(values)
      return unless values.is_a? Array
      values.group_by {|v| v}.transform_values(&:size)
    end
  end

  class NoOpReducer < ReducerBase
    def self.name
      'no_op'
    end

    # Used to compile list of free-format answers.
    # @param Array<string>
    # @return Array<string> the same input it receives.
    def self.reduce(values)
      values
    end
  end
end
