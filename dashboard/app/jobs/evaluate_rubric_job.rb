class EvaluateRubricJob < ApplicationJob
  queue_as :default

  # To make this job get run in development, you have two options:
  # 1. switch the queue_adapter value here to :async, or
  # 2. leave the value as :delayed_job, and run the delayed job worker locally
  #    via `dashboard/bin/delayed_job restart` or rake build
  self.queue_adapter = :delayed_job

  rescue_from(StandardError) do |exception|
    if rack_env?(:development)
      puts "EvaluateRubricJob Error: #{exception.full_message}"
    end
    raise
  end

  # 2D Map from unit name and level name, to the name of the lesson files in S3
  # which will be used for AI evaluation.
  # TODO: This is a temporary solution. After the pilot, we should at least make
  # the S3 pointer editable on levelbuilder, and eventually make all of the data
  # it points to editable there too.
  UNIT_AND_LEVEL_TO_LESSON_S3_NAME = {
    'csd3-2023' => {
      'CSD U3 Interactive Card Final_2023' => 'CSD-2022-U3-L17',
      'CSD U3 Sprites scene challenge_2023' => 'New-U3-2022-L10',
      'CSD web project animated review_2023' => 'New-U3-2022-L13',
      'CSD games sidescroll review_2023' => 'New-U3-2022-L20'
    }
  }

  def perform(user_id:, script_level_id:)
    user = User.find(user_id)
    script_level = ScriptLevel.find(script_level_id)
    lesson_s3_name = EvaluateRubricJob.get_lesson_s3_name(script_level)

    raise "lesson_s3_name not found for script_level_id: #{script_level.id}" if lesson_s3_name.blank?

    channel_id = get_channel_id(user, script_level)
    _code, project_version = read_user_code(channel_id)

    rubric = Rubric.find_by!(lesson_id: script_level.lesson.id, level_id: script_level.level.id)

    ai_evaluations = get_fake_openai_evaluations(rubric, understanding_s: 'Extensive Evidence')

    write_ai_evaluations(user, ai_evaluations, rubric, channel_id, project_version)
  end

  def self.ai_enabled?(script_level)
    !!get_lesson_s3_name(script_level)
  end

  # returns the path suffix of the location in S3 which contains the config
  # needed to evaluate the rubric for the given script level.
  def self.get_lesson_s3_name(script_level)
    UNIT_AND_LEVEL_TO_LESSON_S3_NAME[script_level&.script&.name].try(:[], script_level&.level&.name)
  end

  # get the channel id of the project which stores the user's code on this script level.
  private def get_channel_id(user, script_level)
    # get the user's storage id from the database
    user_storage_id = storage_id_for_user_id(user.id)

    # get the channel id for this user's level (or project template level) from the database
    channel_token = ChannelToken.find_channel_token(
      script_level.level,
      user_storage_id,
      script_level.script_id
    )
    raise "channel token not found for user id #{user.id} and script level id #{script_level.id}" unless channel_token
    channel_token.channel
  end

  private def read_user_code(channel_id)
    # fetch the user's code from S3
    source_data = SourceBucket.new.get(channel_id, "main.json")
    raise "main.json not found for channel id #{channel_id}" unless source_data[:status] == 'FOUND'
    code = JSON.parse(source_data[:body].string)['source']
    version = source_data[:version_id]
    [code, version]
  end

  private def get_fake_openai_evaluations(rubric, understanding_s: 'Extensive Evidence')
    rubric.learning_goals.map do |learning_goal|
      {
        'Key Concept' => learning_goal.learning_goal,
        'Grade' => understanding_s
      }
    end
  end

  private def write_ai_evaluations(user, ai_evaluations, rubric, channel_id, project_version)
    _owner_id, project_id = storage_decrypt_channel_id(channel_id)

    # record the ai evaluations to the database
    # TODO: pass along and update the 'requester' to the correct id
    ActiveRecord::Base.transaction do
      ai_evaluations.each do |evaluation|
        learning_goal = rubric.learning_goals.all.find {|lg| lg.learning_goal == evaluation['Key Concept']}
        understanding = understanding_s_to_i(evaluation['Grade'])
        LearningGoalAiEvaluation.create!(
          user_id: user.id,
          learning_goal_id: learning_goal.id,
          requester_id: user.id,
          project_id: project_id,
          project_version: project_version,
          understanding: understanding
        )
      end
    end
  end

  private def understanding_s_to_i(understanding)
    case understanding
    when 'Extensive Evidence'
      SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.EXTENSIVE
    when 'Convincing Evidence'
      SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.CONVINCING
    when 'Limited Evidence'
      SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.LIMITED
    when 'No Evidence'
      SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.NONE
    else
      raise "Unexpected understanding: #{understanding}"
    end
  end
end
