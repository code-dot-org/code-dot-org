# This script finds all of the UserLevelEvaluation records and migrates them to StudentWorkEvaluations
# with type "UserLevelEvaluation"

require_relative '../../dashboard/config/environment'
require src_dir 'database'

count_evaluations_moved = 0
all_old_ules = UserLevelEvaluationOld.all
all_old_ules_count = all_old_ules.count

puts "There are #{all_old_ules_count} UserLevelEvaluationOld records to move to StudentWorkEvaluations."
puts "Moving UserLevelEvaluationOld records to StudentWorkEvaluations..."

time_taken = Benchmark.realtime do
  ActiveRecord::Base.transaction do
    all_old_ules.each do |old_ule|
      new_swe = StudentWorkEvaluation.new(
        type: "UserLevelEvaluation",
        student_id: old_ule.user_id,
        level_id: old_ule.level_id,
        unit_id: old_ule.script_id,
        school_year: old_ule.school_year,
        evaluator: "AI",
        evaluation_criteria: old_ule.evaluation_criteria,
        reasoning: old_ule.ai_reasoning,
        evaluation: old_ule.ai_evaluation,
        ai_model_version: old_ule.ai_model_version,
        code_version: old_ule.code_version,
        created_at: old_ule.created_at,
        updated_at: old_ule.updated_at,
      )
      if new_swe.save
        puts "."
        old_ule.destroy
        count_evaluations_moved += 1
      else
        raise "Failed to save StudentWorkEvaluation: #{new_swe.errors.full_messages}"
      end
    end
  end
end

puts "It took #{time_taken} seconds to move #{count_evaluations_moved} evaluations."
