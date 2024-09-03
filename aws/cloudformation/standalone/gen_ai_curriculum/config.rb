require "ostruct"
require_relative '../../../../lib/cdo/shared_constants'

module Config
  # Configuration for each endpoint used in the Gen AI Curriculum. Required properties:
  #   hf_model_id: HuggingFace model ID
  #   model_id: App-wide model ID (from shared constants)
  #   model_name: Short name for naming resources (letters only)
  #   instance_type: EC2 Instance Type for endpoint
  #   min_num_instances (production only): Minimum number of deployed instances used for autoscaling on production
  #     on test, only a single instance will be used without autoscaling to limit resource usage
  #   max_num_instances (production only): Maximum number of deployed instances used for autoscaling on production
  #     not used on test
  #   autoscaling_target_value (production only): Number of requests / minute at which autoscaling starts to take effect
  #     not used on test
  ENDPOINT_CONFIGS = [
    {
      hf_model_id: "mistralai/Mistral-7B-Instruct-v0.1",
      model_id: SharedConstants::AI_CHAT_MODEL_IDS[:MISTRAL],
      model_name: "Mistral",
      instance_type: {
        production: "ml.g5.4xlarge",
        test: "ml.g5.xlarge"
      },
      min_num_instances: 3,
      max_num_instances: 4,
      autoscaling_target_value: 150
    },
    {
      hf_model_id: "BioMistral/BioMistral-7B",
      model_id: SharedConstants::AI_CHAT_MODEL_IDS[:BIOMISTRAL],
      model_name: "BioMistral",
      instance_type: {
        production: "ml.g5.xlarge",
        test: "ml.g5.xlarge"
      },
      min_num_instances: 2,
      max_num_instances: 2,
      autoscaling_target_value: 150
    },
    {
      hf_model_id: "upaya07/Arithmo2-Mistral-7B",
      model_id: SharedConstants::AI_CHAT_MODEL_IDS[:ARITHMO],
      model_name: "Arithmo",
      instance_type: {
        production: "ml.g5.xlarge",
        test: "ml.g5.xlarge"
      },
      min_num_instances: 2,
      max_num_instances: 2,
      autoscaling_target_value: 150
    },
    {
      hf_model_id: "phanerozoic/Mistral-Pirate-7b-v0.3",
      model_id: SharedConstants::AI_CHAT_MODEL_IDS[:PIRATE],
      model_name: "Pirate",
      instance_type: {
        production: "ml.g5.xlarge",
        test: "ml.g5.xlarge"
      },
      min_num_instances: 2,
      max_num_instances: 2,
      autoscaling_target_value: 150
    },
    {
      hf_model_id: "FPHam/Karen_TheEditor_V2_CREATIVE_Mistral_7B",
      model_id: SharedConstants::AI_CHAT_MODEL_IDS[:KAREN],
      model_name: "Karen",
      instance_type: {
        production: "ml.g5.xlarge",
        test: "ml.g5.xlarge"
      },
      min_num_instances: 2,
      max_num_instances: 2,
      autoscaling_target_value: 150
    }
  ].freeze
end
