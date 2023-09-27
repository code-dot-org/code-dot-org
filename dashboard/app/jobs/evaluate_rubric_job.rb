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

    lesson_s3_name = 'CSD-2022-U3-L17'
    channel_id = get_channel_id(user, script_level)
    code = read_user_code(channel_id)
    prompt = read_file_from_s3(lesson_s3_name, 'system_prompt.txt')
    rubric = read_file_from_s3(lesson_s3_name, 'standard_rubric.csv')
    api_key = ENV['OPENAI_API_KEY']

    ai_evaluations = get_openai_evaluations(code, prompt, rubric, api_key)

    rubric = Rubric.find_by!(lesson_id: script_level.lesson.id, level_id: script_level.level.id)

    validate_evaluations(ai_evaluations, rubric)

    write_ai_evaluations(user, ai_evaluations, rubric, channel_id)
  end

  private def get_channel_id(user, script_level)
    # get the user's storage id from the database
    user_storage_id = storage_id_for_user_id(user.id)

    # get the channel id for this user's level (or project template level) from the database
    channel_token = ChannelToken.find_channel_token(
      script_level.level,
      user_storage_id,
      script_level.script_id
    )
    channel_token.channel
  end

  private def read_user_code(channel_id)
    # fetch the user's code from S3
    source_data = SourceBucket.new.get(channel_id, "main.json")
    JSON.parse(source_data[:body].string)['source']
  end

  private def read_file_from_s3(lesson_name, key_suffix)
    bucket = 'cdo-ai'
    key = "teaching_assistant/lessons/#{lesson_name}/#{key_suffix}"
    AWS::S3.create_client.get_object(bucket: bucket, key: key)[:body].read
  end

  private def get_openai_evaluations(code, prompt, rubric, api_key)
    assess_py = PyCall.import_module("assess")

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
      raise 'ERROR: grades not found'
    else
      puts 'Completed assessment.'
      puts
      ai_evaluations = JSON.parse(grade)
      ai_evaluations.each do |evaluation|
        puts "Learning Goal: #{evaluation['Key Concept']}"
        puts "AI Evaluation: #{evaluation['Grade']}"
        puts
      end
    end
    ai_evaluations
  end

  private def validate_evaluations(evaluations, rubric)
    expected_learning_goals = rubric.learning_goals.map(&:learning_goal)
    actual_learning_goals = evaluations.map {|evaluation| evaluation['Key Concept']}
    unless expected_learning_goals == actual_learning_goals
      raise "Expected learning goals #{expected_learning_goals.inspect} but got #{actual_learning_goals.inspect}"
    end
  end

  private def write_ai_evaluations(user, ai_evaluations, rubric, channel_id)
    _owner_id, project_id = storage_decrypt_channel_id(channel_id)

    # record the ai evaluations to the database
    ActiveRecord::Base.transaction do
      ai_evaluations.each do |evaluation|
        learning_goal = rubric.learning_goals.all.find {|lg| lg.learning_goal == evaluation['Key Concept']}
        understanding = grade_to_understanding(evaluation['Grade'])
        LearningGoalAiEvaluation.create!(
          user_id: user.id,
          learning_goal_id: learning_goal.id,
          project_id: project_id,
          understanding: understanding
        )
      end
    end
  end

  private def grade_to_understanding(grade)
    case grade
    when 'Extensive Evidence'
      1
    when 'Convincing Evidence'
      2
    when 'Limited Evidence'
      3
    when 'No Evidence'
      4
    else
      raise "Unexpected grade: #{grade}"
    end
  end
end
