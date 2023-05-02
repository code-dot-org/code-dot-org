require 'test_helper'
require 'pd/survey_pipeline/reducer'

module Pd::SurveyPipeline
  class AvgReducerTest < ActiveSupport::TestCase
    test 'return average for an array of float-convertible strings' do
      input = %w(1 2 3 4 5 6)
      assert_equal 3.5, Reducer::Average.reduce(input)
    end

    test 'return nil for empty input' do
      input = []
      refute Reducer::Average.reduce(input)
    end
  end

  class HistogramReducerTest < ActiveSupport::TestCase
    test 'return histogram of non-empty array' do
      input = %w(a b c c b c)
      expected_output = {'a' => 1, 'b' => 2, 'c' => 3}
      assert_equal expected_output, Reducer::Histogram.reduce(input)
    end

    test 'return empty hash for empty array' do
      input = []
      expected_output = {}
      assert_equal expected_output, Reducer::Histogram.reduce(input)
    end
  end

  class NoOpReducerTest < ActiveSupport::TestCase
    test 'input values pass through intact' do
      input = ['a', 'b', 'c']
      assert_equal input, Reducer::NoOp.reduce(input)
    end
  end
end
