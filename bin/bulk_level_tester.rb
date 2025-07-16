#!/usr/bin/env ruby

require 'csv'
require_relative '../dashboard/config/environment'

def main
  rows = CSV.read('/Users/benjaminbrooks/Downloads/AIF chat prompts - Unit 1.csv', headers: true)
  additional_headers = ['File count (request)', 'File count (level)', 'Flagged input?', 'Response', 'Flagged output?', 'Response time (ms)']

  CSV.open('/Users/benjaminbrooks/Downloads/AIF chat prompts - Unit 1 output (gpt-4o-mini).csv', 'w') do |output_csv|
    output_csv << (rows.headers + additional_headers)

    rows.each do |row|
      level_name = row['Level Name']
      level = Level.find_by(name: level_name)

      if level.nil?
        puts "Error: Level with name '#{level_name}' not found."
        next
      end

      starter_assets = level.starter_assets || {}
      assets = starter_assets.map do |friendly_name, _uuid_name|
        {
          'filename' => friendly_name,
          'source' => 'level'
        }
      end.first(5)

      user = User.find_by(email: 'ben+levelbuilder@code.org')

      temperature = level.aichat_settings.dig('initialCustomizations', 'temperature') || 0.5
      model_customizations = {
        'selectedModelId' => 'gpt-4o-mini',
        'temperature' => temperature,
        'retrievalContexts' => [],
        'systemPrompt' => ''
      }

      new_message = {
        'role' => 'user',
        'chatMessageText' => row['Suggested prompt'],
        'status' => 'unknown',
        'assets' => assets
      }

      # Create the AichatRequest
      request = AichatRequest.create!(
        user_id: user.id,
        level_id: level.id,
        script_id: nil, # Set to appropriate script ID if needed
        project_id: nil, # Set to appropriate project ID if needed
        model_customizations: model_customizations,
        stored_messages: [],
        new_message: new_message
      )

      # Set locale for the job
      locale = 'en'

      # Copied out of AichatRequestChatCompletionJob
      user_toxicity = AichatSafetyHelper.find_toxicity('user', request.new_message['chatMessageText'], locale, request.level_id)
      puts [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], user_toxicity.to_json] if user_toxicity

      begin
        start_time = Time.now
        response = AichatAiHelper.get_openai_assistant_response(
          request.model_customizations,
          request.stored_messages,
          request.new_message,
          request.level_id,
          request.project_id,
          request.user_id
        )
        response_time = ((Time.now - start_time) * 1000).to_i

        model_toxicity = AichatSafetyHelper.find_toxicity('assistant', response, locale, request.level_id)
      rescue Net::ReadTimeout
        puts "timeout on level #{level.id}"
        response = 'timeout'
        model_toxicity = 'timeout'
      rescue JSON::ParserError
        puts 'Error parsing JSON response from OpenAI'
        model_toxicity = 'error'
      end

      output = {
        file_count_in_request: assets.length,
        file_count_in_level: starter_assets.length,
        flagged_input: user_toxicity,
        response: response,
        flagged_output: model_toxicity,
        response_time: response_time
      }

      output_csv << (row.fields + output.values)
    end
  end
rescue StandardError => exception
  puts "Error: #{exception.message}"
  puts exception.backtrace.first(5).join("\n")
  exit 1
end

main
