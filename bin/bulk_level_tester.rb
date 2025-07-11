#!/usr/bin/env ruby

# Ruby script to create an AichatRequest and AichatRequestChatCompletionJob
# that looks up the level with name test-problem-solving-with-ai-lesson2-level3_2025
# and includes all of the level's starter_assets in the request

require_relative '../dashboard/config/environment'

def main
  # Level name to look up
  level_names = [
    # 'test-problem-solving-with-ai-lesson2-level2_2025',
    'test-problem-solving-with-ai-lesson2-level3_2025'
  ]

  level_names.each do |level_name|
    # Look up the level by name
    level = Level.find_by(name: level_name)

    if level.nil?
      puts "Error: Level with name '#{level_name}' not found."
      exit 1
    end

    puts "Found level: #{level.name} (ID: #{level.id})"
    puts "Level type: #{level.type}"

    # Get starter assets from the level
    starter_assets = level.starter_assets || {}
    puts "Starter assets found: #{starter_assets.keys.count}"

    if starter_assets.any?
      puts "Starter asset files:"
      starter_assets.each do |friendly_name, uuid_name|
        puts "  - #{friendly_name} (#{uuid_name})"
      end
    else
      puts "No starter assets found for this level."
    end

    # Create a user for testing (or use an existing one)
    # In a real scenario, you'd use the actual user making the request
    user = User.find_by(email: 'ben+levelbuilder@code.org')

    puts "Using user: #{user.name} (ID: #{user.id})"

    # Prepare the model customizations
    model_customizations = {
      'selectedModelId' => 'gpt-4o-mini',
      'temperature' => 0.5,
      'retrievalContexts' => [],
      'systemPrompt' => ''
    }

    # Prepare the new message that includes references to starter assets
    # Create asset references for each starter asset
    assets = starter_assets.map do |friendly_name, _uuid_name|
      {
        'filename' => friendly_name,
        'source' => 'level'
      }
    end

    new_message = {
      'role' => 'user',
      'chatMessageText' => "I'm a Parks and Rec worker looking for a project to improve a playground with swings, slides, and benches. Analyze this image. What are some ideas for how to improve this playground?",
      'status' => 'unknown',
      'timestamp' => (Time.now.to_f * 1000).to_i,
      'assets' => assets
    }

    puts "\nCreating AichatRequest with #{assets.count} asset references..."

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

    puts "✓ Created AichatRequest with ID: #{request.id}"
    puts "  - User ID: #{request.user_id}"
    puts "  - Level ID: #{request.level_id}"
    puts "  - Model: #{request.model_customizations['selectedModelId']}"
    puts "  - Temperature: #{request.model_customizations['temperature']}"
    puts "  - Assets included: #{request.new_message['assets'].count}"

    # Set locale for the job
    locale = 'en'

    # Display the asset details that will be available to the AI
    if assets.any?
      puts "\nAsset details that will be sent to AI:"
      assets.each do |asset|
        puts "  - Filename: #{asset['filename']}"
        puts "    Source: #{asset['source']}"
        puts "    URL will be: /level_starter_assets/#{level.name}/#{asset['filename']}"
      end
    end

    # Copied out of AichatRequestChatCompletionJob
    user_toxicity = AichatSafetyHelper.find_toxicity('user', request.new_message['chatMessageText'], locale, request.level_id)
    puts [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:USER_PROFANITY], user_toxicity.to_json] if user_toxicity

    # Note: any interest in adding level system prompt as well?
    response = AichatAiHelper.get_openai_assistant_response(
      request.model_customizations,
      request.stored_messages,
      request.new_message,
      request.level_id,
      request.project_id,
      request.user_id
    )

    # Moderate model output for toxicity.
    model_toxicity = AichatSafetyHelper.find_toxicity('assistant', response, locale, request.level_id)
    puts [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:MODEL_PROFANITY], model_toxicity.to_json] if model_toxicity

    puts [SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS], response]
  end
rescue StandardError => exception
  puts "Error: #{exception.message}"
  puts exception.backtrace.first(5).join("\n")
  exit 1
end

main
