class EvaluateRubricJob < ApplicationJob
  queue_as :default

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

  def perform(user_id:, script_level_id:, lesson_s3_name:)
    user = User.find(user_id)
    script_level = ScriptLevel.find(script_level_id)
    puts "Evaluating rubric for user #{user.id} on script level #{script_level.id} with lesson_s3_name: #{lesson_s3_name.inspect}"

    raise 'CDO.openai_evaluate_rubric_api_key required' if CDO.openai_evaluate_rubric_api_key.blank?

    puts "TODO: Implement the rest of this job"
  end
end
