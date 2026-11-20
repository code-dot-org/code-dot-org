require 'test_helper'

class ChallengeEvaluationOpenaiHelperTest < ActiveSupport::TestCase
  test 'request_evaluation sends reasoning effort low and no temperature' do
    messages = [{role: 'system', content: 'rubric'}]
    response_format = {type: 'json_schema', json_schema: {name: 'evaluation', schema: {type: 'object'}}}

    HTTParty.expects(:post).with do |url, options|
      body = JSON.parse(options[:body])
      url == ChallengeEvaluationOpenaiHelper::Client::OPEN_AI_URL &&
        options[:headers]['Authorization'] == 'Bearer test-key' &&
        body['model'] == EvaluateChallengeResponseJob::MODEL &&
        body['reasoning_effort'] == 'low' &&
        !body.key?('temperature') &&
        body['messages'] == JSON.parse(messages.to_json) &&
        body['response_format'] == JSON.parse(response_format.to_json)
    end.returns(mock('response'))

    ChallengeEvaluationOpenaiHelper::Client.new('test-key', EvaluateChallengeResponseJob::MODEL).
      request_evaluation(messages, response_format)
  end
end
