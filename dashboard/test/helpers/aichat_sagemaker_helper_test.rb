require 'test_helper'

class AichatSagemakerHelperTest < ActionView::TestCase
  include AichatSagemakerHelper

  setup do
    @common_model_customizations = {temperature: 0.5, retrievalContexts: ["test retrieval"], systemPrompt: "test prompt"}
    @stored_messages = [
      {
        role: 'user',
        chatMessageText: 'hello from user',
      }.stringify_keys,
      {
        role: 'assistant',
        chatMessageText: 'assistant response',
      }.stringify_keys
    ]
    @new_message = {role: 'user', chatMessageText: 'new message from user'}.stringify_keys
    @level = Level.create({name: 'Aichat level', properties: {aichat_settings: {levelSystemPrompt: "Be safe."}}})
    @level_without_level_system_prompt = Level.create({name: 'Aichat level without level system prompt', properties: {aichat_settings: {}}})
  end

  test 'Testing format_inputs_for_sagemaker_request with Mistral base model' do
    base_model_customizations = @common_model_customizations.merge(selectedModelId: SharedConstants::AI_CHAT_MODEL_IDS[:MISTRAL]).stringify_keys
    inputs = AichatSagemakerHelper.format_inputs_for_sagemaker_request(base_model_customizations, @stored_messages, @new_message, @level.id)
    expected_base_model_inputs = "<s>[INST]Be safe. test prompt test retrieval[/INST][INST]hello from user[/INST]assistant response</s>[INST]new message from user[/INST]"
    assert_equal inputs[:inputs], expected_base_model_inputs
  end

  test 'Testing format_inputs_for_sagemaker_request with Mistral base model with no level system prompt' do
    base_model_customizations = @common_model_customizations.merge(selectedModelId: SharedConstants::AI_CHAT_MODEL_IDS[:MISTRAL]).stringify_keys
    inputs = AichatSagemakerHelper.format_inputs_for_sagemaker_request(base_model_customizations, @stored_messages, @new_message, @level_without_level_system_prompt.id)
    expected_base_model_inputs = "<s>[INST]test prompt test retrieval[/INST][INST]hello from user[/INST]assistant response</s>[INST]new message from user[/INST]"
    assert_equal inputs[:inputs], expected_base_model_inputs
  end

  test 'Testing format sagemaker model output for Mistral base model' do
    model_processor = AiModelProcessors::MistralProcessor.new
    generated_text = "<s>[INST]where is Chattanooga[/INST] Chattanooga is a city located in the southeastern United States, in the state of Tennessee."
    model_output = model_processor.format_model_output(generated_text)
    expected_model_output = " Chattanooga is a city located in the southeastern United States, in the state of Tennessee."
    assert_equal model_output, expected_model_output
  end
end
