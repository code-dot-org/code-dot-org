require "ostruct"
require "digest"
require_relative '../../../../../lib/cdo/shared_constants'

module Config
  # Configuration for each endpoint used in the Gen AI Curriculum. Required properties:
  #   hf_model_id: HuggingFace model ID
  #   model_id: App-wide model ID (from shared constants)
  #   model_name: Short name for naming resources (alphanumeric only)
  #   instance_type: EC2 Instance Type for endpoint
  #   min_num_instances: Minimum number of deployed instances used for autoscaling
  #   max_num_instances: Maximum number of deployed instances used for autoscaling
  #   autoscaling_target_value: Number of requests / minute at which autoscaling starts to take effect
  ENDPOINT_CONFIGS = [
    {
      hf_model_id: "mistralai/Mistral-7B-Instruct-v0.1",
      model_id: SharedConstants::AI_CHAT_MODEL_IDS[:MISTRAL],
      model_name: "Mistral",
      instance_type: "ml.g5.4xlarge",
      min_num_instances: 2,
      max_num_instances: 4,
      autoscaling_target_value: 150
    }
  ].freeze

  # Generate a stable fingerprint for SageMaker Model resource naming.
  # Only changes when the model definition changes (requiring a new Model resource).
  def self.model_fingerprint(config)
    Digest::MD5.hexdigest(config[:hf_model_id])[0..7]
  end

  # Generate a stable fingerprint for SageMaker EndpointConfig resource naming.
  # Only changes when EndpointConfig properties change (requiring a new EndpointConfig resource).
  def self.endpoint_config_fingerprint(config)
    Digest::MD5.hexdigest("#{config[:hf_model_id]}-#{config[:instance_type]}-#{config[:min_num_instances]}")[0..7]
  end
end
