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
    filter_result = ShareFiltering.find_failure(message, locale, {}) if message
    # If the content is profane, we skip sending to OpenAI and instead hardcode a warning response on the front-end.
    return render(status: :ok, json: {safety_status: filter_result.type, flagged_content: filter_result.content}) if filter_result && filter_result.type == 'profanity'

    # The system prompt is stored server-side so we need to prepend it to the student's messages
    system_prompt = read_file_from_s3(S3_TUTOR_SYSTEM_PROMPT_PATH)

    # Determine if the level is validated and fetch test file contents if it is
    test_file_contents = ""
    if validated_level?
      level_id = params[:levelId]
      test_file_contents = get_validated_level_test_file_contents(level_id)
    end

    updated_system_prompt = add_content_to_system_prompt(system_prompt, params[:levelInstructions], test_file_contents)
    messages = prepend_system_prompt(updated_system_prompt, params[:messages])

    response = OpenaiChatHelper.request_chat_completion(messages)
    chat_completion_return_message = OpenaiChatHelper.get_chat_completion_response_message(response)
    # We currently allow PII flagged content through to OpenAI because false positives were impacting user experience.
    # We send the flagged content along in the request so we can log it for analysis.
    chat_completion_return_message[:json][:safety_status] = filter_result.type if filter_result
    chat_completion_return_message[:json][:flagged_content] = filter_result.content if filter_result
    return render(status: chat_completion_return_message[:status], json: chat_completion_return_message[:json])
  end

  def has_required_messages_param?
    params[:messages].present?
  end

  def validated_level?
    params[:type].present? && params[:type] == 'validation'
  end

  def add_content_to_system_prompt(system_prompt, level_instructions, test_file_contents)
    if level_instructions.present?
      system_prompt += "\n Here are the student instructions for this level: #{level_instructions}"
    end

    if test_file_contents.present?
      system_prompt += "\n The contents of the test file are: #{test_file_contents}"
    end

    system_prompt
  end

  private def prepend_system_prompt(system_prompt, messages)
    system_prompt_message = {
      content: system_prompt,
      role: "system"
    }

    messages.unshift(system_prompt_message)
    messages
  end

  private def read_file_from_s3(key_path)
    full_s3_path = "#{S3_AI_BUCKET}/#{key_path}"
    cache_key = "s3_file:#{full_s3_path}"
    unless Rails.env.development?
      cached_content = CDO.shared_cache.read(cache_key)
      return cached_content if cached_content.present?
    end

    if Rails.env.development?
      local_path = File.join("local-aws", S3_AI_BUCKET, key_path)
      if File.exist?(local_path)
        puts "Note: Reading AI prompt from local file: #{key_path}"
        return File.read(local_path)
      end
    end

    # Note: We will hit this codepath in dev if the file is not found locally
    content = s3_client.get_object(bucket: S3_AI_BUCKET, key: key_path).body.read

    # In production and test, cache the content after fetching it from S3
    unless Rails.env.development?
      CDO.shared_cache.write(cache_key, content, expires_in: 1.hour)
    end
    return content
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
