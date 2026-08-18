# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#  index_levels_on_type       (type)
#
class Quiz < Level
  serialized_attrs %w(
    title
    time_limit_minutes
    show_correctness
    reveal_answer_explanation
    purpose
    intro_text
    allow_multiple_attempts
    max_attempts
  )

  PURPOSES = %w(exam exam_simulation practice check_for_understanding).freeze
  validates :purpose, inclusion: {in: PURPOSES}, allow_nil: true

  validate :reveal_answer_explanation_requires_show_correctness
  validate :max_attempts_requires_allow_multiple_attempts

  has_many :quiz_level_questions, foreign_key: :level_id, dependent: :destroy
  has_many :quiz_questions, through: :quiz_level_questions
  has_many :quiz_attempts, foreign_key: :level_id, dependent: :destroy

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.quiz,
        level_num: 'custom',
      )
    )
  end

  def uses_lab2?
    true
  end

  # POC only: dumps quiz_questions into levelProperties so the frontend stub
  # (apps/src/quiz/Quiz.tsx) has something to render and answer. Not the real
  # payload shape - question rendering/authoring UI is a later milestone.
  #
  # Correct-answer fields (e.g. correct_choice_id) are deliberately excluded
  # so grading stays server-side; see QuizQuestion#auto_gradable?/#grade and
  # QuizQuestionResponsesController.
  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil, unit_group_unit: nil)
    properties_camelized = super
    properties_camelized[:scriptId] = script&.id
    properties_camelized[:quizQuestions] = quiz_questions.map do |question|
      {
        id: question.id,
        type: question.type,
        questionName: question.question_name,
        stem: question.question['stem'],
        choices: question.question['choices'],
        explanation: question.explanation,
      }
    end
    properties_camelized
  end

  private def reveal_answer_explanation_requires_show_correctness
    return unless reveal_answer_explanation? && !show_correctness?
    errors.add(:reveal_answer_explanation, 'cannot be true unless show_correctness is also true')
  end

  # max_attempts blank means unlimited attempts (once allow_multiple_attempts
  # is true) - not yet enforced anywhere (P0 only builds the
  # allow_multiple_attempts on/off switch), but declared now since it's just
  # another serialized_attrs key, not a migration, so the eventual shape
  # doesn't need renaming/restructuring later.
  private def max_attempts_requires_allow_multiple_attempts
    return if max_attempts.blank?
    unless allow_multiple_attempts?
      errors.add(:max_attempts, 'cannot be set unless allow_multiple_attempts is also true')
      return
    end
    errors.add(:max_attempts, 'must be at least 2') if max_attempts.to_i < 2
  end
end
