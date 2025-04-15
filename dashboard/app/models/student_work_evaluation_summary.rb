# == Schema Information
#
# Table name: student_work_evaluation_summaries
#
#  id                                 :bigint           not null, primary key
#  student_work_evaluation_id         :bigint           not null
#  student_work_evaluation_summary_id :bigint           not null
#  created_at                         :datetime         not null
#  updated_at                         :datetime         not null
#
# Indexes
#
#  fk_rails_49598559b9  (student_work_evaluation_id)
#  fk_rails_d50fa61780  (student_work_evaluation_summary_id)
#
class StudentWorkEvaluationSummary < ApplicationRecord
  # student_work_evaluation_id is the ID of the StudentWorkEvaluation that was summarized
  # student_work_evaluation_summary_id is the ID of the StudentWorkEvaluation that is the summary
  # For example, if a UserLevelEvaluation is based on the roll-up of multiple UserSkillEvaluations,
  # then student_work_evaluation_id is the ID of one of the UserLevelSkillEvaluations and
  # student_work_evaluation_summary_id is the ID of the UserLevelEvaluation.
  belongs_to :student_work_evaluation
  belongs_to :student_work_evaluation_summary, class_name: 'StudentWorkEvaluation'
end
