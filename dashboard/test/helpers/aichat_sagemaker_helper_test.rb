require 'test_helper'

class AichatSagemakerHelperTest < ActionView::TestCase
  include AichatSagemakerHelper

  setup do
    @common_model_customizations = {temperature: 0.5, retrievalContexts: ["test retrieval"], systemPrompt: "test prompt"}
    @stored_messages = [
      {
        role: 'user',
        chatMessageText: 'hello from user',
      },
      {
        role: 'assistant',
        chatMessageText: 'assistant response',
      }
    ]
    @new_message = {role: 'user', chatMessageText: 'new message from user'}
  end

  test 'Testing format_inputs_for_sagemaker_request with Mistral base model' do
    base_model_customizations = @common_model_customizations.merge(selectedModelId: AichatSagemakerHelper::MODELS[:BASE])
    inputs = AichatSagemakerHelper::format_inputs_for_sagemaker_request(base_model_customizations, @stored_messages, @new_message)
    expected_base_model_inputs = "<s>[INST]test prompt test retrieval[/INST][INST]hello from user[/INST]assistant response</s>[INST]new message from user[/INST]"
    assert inputs[:inputs] == expected_base_model_inputs
  end

  test 'Testing format_inputs_for_sagemaker_request with Karen model' do
    karen_model_customizations = @common_model_customizations.merge(selectedModelId: AichatSagemakerHelper::MODELS[:KAREN])
    inputs = AichatSagemakerHelper::format_inputs_for_sagemaker_request(karen_model_customizations, @stored_messages, @new_message)
    expected_karen_model_inputs = "<|im_start|>system\ntest prompt test retrieval<|im_end|>\n<|im_start|>user\nEdit the following text for spelling and grammar mistakes: new message from user<|im_end|>\n<|im_start|>assistant"
    assert inputs[:inputs] == expected_karen_model_inputs
  end

  test 'Testing format_inputs_for_sagemaker_request with Arithmo model' do
    arithmo_model_customizations = @common_model_customizations.merge(selectedModelId: AichatSagemakerHelper::MODELS[:ARITHMO])
    inputs = AichatSagemakerHelper::format_inputs_for_sagemaker_request(arithmo_model_customizations, @stored_messages, @new_message)
    expected_arithmo_model_inputs = "Question: test prompt test retrieval new message from user\nAnswer:"
    assert inputs[:inputs] == expected_arithmo_model_inputs
  end

  test 'Testing format_inputs_for_sagemaker_request with Pirate model for custom stop string' do
    pirate_model_customizations = @common_model_customizations.merge(selectedModelId: AichatSagemakerHelper::MODELS[:PIRATE])
    inputs = AichatSagemakerHelper::format_inputs_for_sagemaker_request(pirate_model_customizations, @stored_messages, @new_message)
    expected_pirate_stop_strings = ["},"]
    assert_equal inputs[:parameters][:stop], expected_pirate_stop_strings
  end


  test 'Testing fo'
end
