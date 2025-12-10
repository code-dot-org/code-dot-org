class AiRubricMetrics
  # The CloudWatch metric namespace
  AI_RUBRIC_METRICS_NAMESPACE = 'AiRubric'.freeze

  # The firehose study name
  AI_RUBRICS_FIREHOSE_STUDY = 'ai-rubrics'.freeze

  # Write out metrics reflected in the response to CloudWatch
  #
  # Currently, this keeps track of a curated set of metrics returned
  # within the 'metadata.usage' field of the returned response from
  # the AI proxy service.
  #
  # @param [Hash] response The parsed JSON response from the AI proxy.
  def self.log_token_metrics(response)
    # Record the metadata
    # The aiproxy service will report the usage in the metadata via:
    # { metadata: { agent: 'openai', usage: { total_tokens: 1234, prompt_tokens: 432, completion_tokens: 802 } } }
    [:TotalTokens, :PromptTokens, :CompletionTokens].each do |name|
      # Send a metric to the AIRubric namespace under categories for both the
      # service used (openai, etc) and the current environment.
      tokens = response.dig('metadata', 'usage', name.to_s.underscore)
      next if tokens.nil?
      agent = response.dig('metadata', 'agent') || 'unknown'
      log_metric(metric_name: name, agent: agent, value: tokens)
    end
  end

  def self.log_metric(metric_name:, agent: nil, value: 1)
    Cdo::Metrics.push(
      AI_RUBRIC_METRICS_NAMESPACE,
      [
        {
          metric_name: metric_name,
          value: value,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
            {name: 'Agent', value: agent},
          ],
          unit: 'Count'
        }
      ]
    )
  end

  # Log thumbs up / down feedback for AI evaluation
  # @param [LearningGoalAiEvaluationFeedback] feedback
  def self.log_feedback(feedback)
    Cdo::Metrics.push(
      AI_RUBRIC_METRICS_NAMESPACE,
      [
        {
          metric_name: 'LearningGoalAiEvaluationFeedback',
          value: 1,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
            {name: 'Approval', value: feedback.ai_feedback_approval ? 'thumbs_up' : 'thumbs_down'}
          ],
          unit: 'Count',
        }
      ]
    )
  end
end
