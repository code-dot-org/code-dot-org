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
  # custom_intro_text, if set, is shown once on the pre-attempt 'start quiz'
  # screen before timer/attempt begins (blank falls back to default framing
  # text on the frontend). Distinct from instructions, which stays available
  # in the persistent Instructions panel throughout the attempt.
  serialized_attrs %w(
    time_limit_minutes
    show_correctness
    reveal_answer_explanation
    purpose
    custom_intro_text
    show_intro_screen
    allow_multiple_attempts
    max_attempts
    question_placements
    show_questions_after_submit
  )

  PURPOSES = %w(exam exam_simulation practice check_for_understanding).freeze
  validates :purpose, inclusion: {in: PURPOSES}, allow_nil: true
  # nil/blank means "no time limit" - only a set value has to be a real
  # positive duration.
  validates :time_limit_minutes, numericality: {only_integer: true, greater_than: 0}, allow_blank: true

  validate :reveal_answer_explanation_requires_show_correctness
  validate :reveal_answer_explanation_requires_questions_shown
  validate :max_attempts_requires_allow_multiple_attempts
  validate :show_intro_screen_required_when_time_limit

  # The dependent: :destroy clause ensures associated join models are deleted but note that bank questions are shared and stay.
  has_many :placements, -> {order(:page, :position)}, class_name: 'QuizQuestionPlacement', foreign_key: :level_id, inverse_of: :level, dependent: :destroy
  has_many :questions, through: :placements, source: :quiz_question
  # The dependent: nil clause ensures student attempts are kept when this quiz is deleted.
  has_many :attempts, class_name: 'QuizAttempt', foreign_key: :level_id, inverse_of: :level, dependent: nil

  def self.import_question_placements_for(levels)
    levels.each {|level| level.import_question_placements! if level.is_a?(Quiz)}
  end

  # question_placements (the desired state, already populated on this
  # in-memory object loaded from a .level file) is
  # imported into QuizQuestionPlacement rows (what's actually
  # persisted). This deletes and recreates rather than updating in place.
  def import_question_placements!
    questions_by_key = QuizQuestion.where(key: (question_placements || []).map {|entry| entry['question_key']}).index_by(&:key)

    desired = (question_placements || []).map do |entry|
      question = questions_by_key[entry['question_key']]
      raise "quiz #{name.dump}: unknown question_key #{entry['question_key'].dump}" unless question
      {quiz_question_id: question.id, page: entry['page'], position: entry['position']}
    end

    existing = placements.map {|p| {quiz_question_id: p.quiz_question_id, page: p.page, position: p.position}}
    return if existing.sort_by {|h| h[:quiz_question_id]} == desired.sort_by {|h| h[:quiz_question_id]}

    placements.delete_all
    desired.each {|d| placements.create!(d)}
    placements.reset
  end

  def save_question_placements!
    self.question_placements = placements.includes(:quiz_question).map do |placement|
      {
        'question_key' => placement.quiz_question.key,
        'page' => placement.page,
        'position' => placement.position,
      }
    end
    save!
  end

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

  # Placements are quiz-owned join rows; questions stay shared bank content.
  def clone_with_suffix(new_suffix, editor_experiment: nil, allow_existing: true)
    suffix = new_suffix[0] == '_' ? new_suffix : "_#{new_suffix}"
    max_index = 70 - suffix.length - 1
    new_name = "#{base_name[0..max_index]}#{suffix}"
    existing = Level.find_by_name(new_name)
    return existing if existing && allow_existing

    level = super(suffix, editor_experiment: editor_experiment, allow_existing: allow_existing)
    placements.each do |placement|
      level.placements.create!(quiz_question: placement.quiz_question, page: placement.page, position: placement.position)
    end
    level
  end

  # Adds quiz_questions into levelProperties so the frontend can render and
  # answer them. Correct-answer and explanation fields (e.g. correct_choice_id)
  # are deliberately excluded so grading stays server-side.
  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil, unit_group_unit: nil)
    properties_camelized = super
    properties_camelized[:scriptId] = script&.id
    # Iterates placements rather than questions directly so each question's
    # page is available alongside it. Ordering matches
    # QuizQuestionPlacement's own default_scope (page, then position).
    properties_camelized[:quizQuestions] = placements.includes(:quiz_question).map do |placement|
      question = placement.quiz_question
      {
        id: question.id,
        type: question.type,
        questionName: question.name,
        questionTitle: question.content['question_title'],
        choices: question.content['choices'],
        page: placement.page,
      }
    end
    properties_camelized
  end

  private def reveal_answer_explanation_requires_show_correctness
    return unless reveal_answer_explanation? && !show_correctness?
    errors.add(:reveal_answer_explanation, 'cannot be true unless show_correctness is also true')
  end

  # The explanation only ever surfaces on a per-question result card, which
  # only renders when show_questions_after_submit is on.
  private def reveal_answer_explanation_requires_questions_shown
    return unless reveal_answer_explanation? && !show_questions_after_submit?
    errors.add(:reveal_answer_explanation, 'cannot be true unless show_questions_after_submit is also true')
  end

  # A time limit with no intro screen means a student could start the timer
  # without ever being told there is one - custom_intro_text has no such
  # requirement, since the frontend falls back to default framing text when
  # it's blank.
  private def show_intro_screen_required_when_time_limit
    return unless time_limit_minutes.present? && !show_intro_screen?
    errors.add(:show_intro_screen, 'cannot be false when time_limit_minutes is set')
  end

  # max_attempts blank means unlimited attempts (once allow_multiple_attempts
  # is true).
  private def max_attempts_requires_allow_multiple_attempts
    return if max_attempts.blank?
    unless allow_multiple_attempts?
      errors.add(:max_attempts, 'cannot be set unless allow_multiple_attempts is also true')
      return
    end
    errors.add(:max_attempts, 'must be at least 2') if max_attempts.to_i < 2
  end
end
