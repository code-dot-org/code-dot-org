class OpenaiChatController < ApplicationController
  S3_AI_BUCKET = 'cdo-ai'.freeze
  S3_TUTOR_SYSTEM_PROMPT_PATH = 'tutor/system_prompt.txt'.freeze

  include OpenaiChatHelper
  authorize_resource class: false

  def s3_client
    @s3_client ||= AWS::S3.create_client
  end

  # POST /openai/chat_completion
  def chat_completion
    unless has_required_messages_param?
      return render(status: :bad_request, json: {})
    end

    # Check for PII / Profanity
    locale = params[:locale] || "en"
    # Just look at the most recent message from the student.
    message = params[:messages].last[:content]
    filter_result = ShareFiltering.find_failure(message, locale) if message
    # If the content is inappropriate, we skip sending to OpenAI and instead hardcode a warning response on the front-end.
    return render(status: :ok, json: {status: filter_result.type, flagged_content: filter_result.content}) if filter_result

    system_prompt = read_file_from_s3(S3_TUTOR_SYSTEM_PROMPT_PATH)
    messages = prepend_system_prompt(system_prompt, params[:levelInstructions], params[:messages])

    if validated_level?
      level_id = params[:levelId]
      test_file_contents = get_validated_level_test_file_contents(level_id)
      messages.first["content"] = messages.first["content"] + " The contents of the test file are: #{test_file_contents}"
      messages.second["content"] = "The student's code is: " + messages.second["content"]
    end

    response = OpenaiChatHelper.request_chat_completion(messages)
    chat_completion_return_message = OpenaiChatHelper.get_chat_completion_response_message(response)
    return render(status: chat_completion_return_message[:status], json: chat_completion_return_message[:json])
  end

  def has_required_messages_param?
    params[:messages].present?
  end

  def validated_level?
    params[:type].present? && params[:type] == 'validation'
  end

  # The system prompt is stored server-side so we need to prepend it to the student's messages.
  private def prepend_system_prompt(system_prompt, level_instructions, messages)
    unless level_instructions.empty?
      system_prompt += "\n Here are the student instructions for this level: " + level_instructions
    end
    system_prompt_message = {
      "content" => system_prompt,
      "role" => "system"
    }

    # Prepend the system prompt message to the messages array
    messages.unshift(system_prompt_message)
    messages
  end

  private def read_file_from_s3(key_path)
    if [:development, :test].include?(rack_env)
      local_path = File.join("local-aws", S3_AI_BUCKET, key_path)
      puts "Reading AI prompt from local file: #{local_path}"
      if File.exist?(local_path)
        puts "Note: Reading AI prompt from local file: #{key_path}"
        return File.read(local_path)
      end
    end
    puts "Reading AI prompt from S3: #{key_path}"
    s3_client.get_object(bucket: S3_AI_BUCKET, key: key_path).body.read
  end

  private def get_validated_level_test_file_contents(level_id)
    level = Level.find(level_id)

    unless level
      return render(status: :bad_request, json: {message: "Couldn't find level with id=#{level_id}."})
    end

    if level.validation.values.empty?
      return render(status: :bad_request, json: {message: "There are no test files associated with level id=#{level_id}."})
    else
      test_file_contents = ""
      level.validation.each_value do |validation|
        test_file_contents += validation["text"]
      end
      return test_file_contents
    end
  end
end
