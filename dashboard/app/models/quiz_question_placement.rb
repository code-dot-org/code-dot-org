# == Schema Information
#
# Table name: quiz_question_placements
#
#  id               :bigint           not null, primary key
#  level_id         :integer          not null
#  quiz_question_id :bigint           not null
#  page             :integer          default(1), not null
#  position         :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_quiz_question_placements_on_level_and_question  (level_id,quiz_question_id) UNIQUE
#  index_quiz_question_placements_on_level_id            (level_id)
#  index_quiz_question_placements_on_quiz_question_id    (quiz_question_id)
#
class QuizQuestionPlacement < ApplicationRecord
  belongs_to :level
  belongs_to :quiz_question

  default_scope {order(:page, :position)}

  validates :position, presence: true

  after_commit :write_to_quiz_file!

  def serializable_hash(options = nil)
    super.except('id', 'level_id', 'quiz_question_id', 'created_at', 'updated_at').
      merge('question_key' => quiz_question.key)
  end

  private def write_to_quiz_file!
    level.with_lock {level.save!} if level.is_a?(Quiz) && !level.destroyed?
  end
end
