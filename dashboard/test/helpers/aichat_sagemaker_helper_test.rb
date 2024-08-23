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
    @level = Level.create({name: 'Aichat level', properties: {aichat_settings: {levelSystemPrompt: "Be safe."}}})
  end

  test 'Testing format_inputs_for_sagemaker_request with Mistral base model' do
    base_model_customizations = @common_model_customizations.merge(selectedModelId: AichatSagemakerHelper::MODELS[:BASE])
    inputs = AichatSagemakerHelper.format_inputs_for_sagemaker_request(base_model_customizations, @stored_messages, @new_message, @level.id)
    expected_base_model_inputs = "<s>[INST]Be safe. test prompt test retrieval[/INST][INST]hello from user[/INST]assistant response</s>[INST]new message from user[/INST]"
    assert_equal inputs[:inputs], expected_base_model_inputs
  end

  test 'Testing format_inputs_for_sagemaker_request with Karen model' do
    karen_model_customizations = @common_model_customizations.merge(selectedModelId: AichatSagemakerHelper::MODELS[:KAREN])
    inputs = AichatSagemakerHelper.format_inputs_for_sagemaker_request(karen_model_customizations, @stored_messages, @new_message, @level.id)
    expected_karen_model_inputs = "<|im_start|>system\nBe safe. test prompt test retrieval<|im_end|>\n<|im_start|>user\nEdit the following text for spelling and grammar mistakes: new message from user<|im_end|>\n<|im_start|>assistant"
    assert_equal inputs[:inputs], expected_karen_model_inputs
  end

  test 'Testing format_inputs_for_sagemaker_request with Arithmo model' do
    arithmo_model_customizations = @common_model_customizations.merge(selectedModelId: AichatSagemakerHelper::MODELS[:ARITHMO])
    inputs = AichatSagemakerHelper.format_inputs_for_sagemaker_request(arithmo_model_customizations, @stored_messages, @new_message, @level.id)
    expected_arithmo_model_inputs = "Question: Be safe. test prompt test retrieval new message from user\nAnswer:"
    assert_equal inputs[:inputs], expected_arithmo_model_inputs
  end

  test 'Testing format_inputs_for_sagemaker_request with Pirate model for custom stop string' do
    pirate_model_customizations = @common_model_customizations.merge(selectedModelId: AichatSagemakerHelper::MODELS[:PIRATE])
    inputs = AichatSagemakerHelper.format_inputs_for_sagemaker_request(pirate_model_customizations, @stored_messages, @new_message, @level.id)
    expected_pirate_stop_strings = ["},"]
    assert_equal inputs[:parameters][:stop], expected_pirate_stop_strings
  end

  test 'Testing format sagemaker model output for Mistral base model' do
    model_processor = AiModelProcessors::MistralProcessor.new
    generated_text = "<s>[INST]where is Chattanooga[/INST] Chattanooga is a city located in the southeastern United States, in the state of Tennessee."
    model_output = model_processor.format_model_output(generated_text)
    expected_model_output = " Chattanooga is a city located in the southeastern United States, in the state of Tennessee."
    assert_equal model_output, expected_model_output
  end

  test 'Testing format sagemaker model output for Pirate model' do
    model_processor = AiModelProcessors::PirateProcessor.new
    generated_text = "<s>[INST]what is your name[/INST] I be a humble servant o' th' briny deep, me hearty, an' I be known by th' name o' th' sea's own whispers. Ye be callin' me Cap'n, an' th' wind be our witness, th' salt be in me veins, an' th' stars be me compass.\" },"
    model_output = model_processor.format_model_output(generated_text)
    expected_model_output = " I be a humble servant o' th' briny deep, me hearty, an' I be known by th' name o' th' sea's own whispers. Ye be callin' me Cap'n, an' th' wind be our witness, th' salt be in me veins, an' th' stars be me compass. "
    assert_equal model_output, expected_model_output
  end

  test 'Testing format sagemaker model output for Karen model' do
    model_processor = AiModelProcessors::KarenProcessor.new
    generated_text = "<|im_start|>system\n<|im_end|>\n<|im_start|>user\nEdit the following text for spelling and grammar mistakes: hi ther<|im_end|>\n<|im_start|>assistant\nHi there!"
    model_output = model_processor.format_model_output(generated_text)
    expected_model_output = "\nHi there!"
    assert_equal model_output, expected_model_output
  end

  test 'Testing format sagemaker model output for Arithmo model' do
    model_processor = AiModelProcessors::ArithmoProcessor.new
    generated_text = "Question:  What is 8 + 9 * 5?\nAnswer:\n 8 + 9 * 5 = 53."
    model_output = model_processor.format_model_output(generated_text)
    expected_model_output = "\n 8 + 9 * 5 = 53."
    assert_equal model_output, expected_model_output
  end
end
