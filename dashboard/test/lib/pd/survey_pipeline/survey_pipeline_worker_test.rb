module Pd::SurveyPipeline
  class SurveyPipelineWorkerTest < ActiveSupport::TestCase
    test 'raise if missing input key' do
      input = {key1: nil}
      required_keys = [:key1, :key2, :key3]

      exception = assert_raises RuntimeError do
        SurveyPipelineWorker.check_required_input_keys required_keys, input
      end

      assert exception.message.start_with?('Missing required input key')
    end
  end
end
