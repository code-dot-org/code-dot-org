class EvaluateRubricJob < ApplicationJob
  queue_as :default

  rescue_from(StandardError) do |exception|
    if rack_env?(:development)
      puts "EvaluateRubricJob Error: #{exception.full_message}"
    end
    raise
  end

  def perform(user_id:, script_level_id:)
    user = User.find(user_id)
    script_level = ScriptLevel.find(script_level_id)
    puts "Evaluating rubric for user #{user.id} on script level #{script_level.id}"

    raise 'CDO.openai_evaluate_rubric_api_key required' if CDO.openai_evaluate_rubric_api_key.blank?

    puts "TODO: Implement the rest of this job"
  end
end
