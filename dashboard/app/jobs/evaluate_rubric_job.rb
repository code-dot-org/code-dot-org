require 'json'
require 'cdo/pycall'

path = File.expand_path('../../../../lib/ai/teaching_assistant/rubric_tester', __FILE__)
PyCall.sys.path.append(path)

class EvaluateRubricJob < ApplicationJob
  queue_as :default

  rescue_from(StandardError) do |exception|
    if rack_env?(:development)
      puts "EvaluateRubricJob Error: #{exception.full_message}"
    end
    raise
  end

  def perform(user_id:, script_level_id:)
    puts "Evaluating rubric for user #{user_id} on script level #{script_level_id}"
    user = User.find(user_id)
    script_level = ScriptLevel.find(script_level_id)

    raise 'OPENAI_API_KEY required' unless ENV['OPENAI_API_KEY']

    assess_py = PyCall.import_module("assess")

    lesson = 'CSD-2022-U3-L17'
    code = read_user_code(user, script_level)
    prompt = read_file_from_s3(lesson, 'system_prompt.txt')
    rubric = read_file_from_s3(lesson, 'standard_rubric.csv')
    api_key = ENV['OPENAI_API_KEY']

    # Get JSON encoded grade
    grade = assess_py.grade(
      code,
      prompt,
      rubric,
      api_key: api_key,
      llm_model: 'gpt-4',
      num_responses: 3,
      temperature: 0.2,
      num_passing_grades: 2
    )

    if grade == -1
      puts 'ERROR.'
    else
      puts 'Completed assessment.'
      puts
      concepts = JSON.parse(grade)
      concepts.each do |concept|
        puts "Learning Goal: #{concept['Key Concept']}"
        puts "AI Evaluation: #{concept['Grade']}"
        puts
      end
    end
  end

  private def read_user_code(user, script_level)
    # get the user's storage id from the database
    user_storage_id = storage_id_for_user_id(user.id)

    # get the channel id for this user's level (or project template level) from the database
    channel_token = ChannelToken.find_channel_token(
      script_level.level,
      user_storage_id,
      script_level.script_id
    )
    channel_id = channel_token.channel

    # fetch the user's code from S3
    source_data = SourceBucket.new.get(channel_id, "main.json")
    JSON.parse(source_data[:body].string)['source']
  end

  private def read_file_from_s3(lesson_name, key_suffix)
    bucket = 'cdo-ai'
    key = "teaching_assistant/lessons/#{lesson_name}/#{key_suffix}"
    AWS::S3.create_client.get_object(bucket: bucket, key: key)[:body].read
  end
end
