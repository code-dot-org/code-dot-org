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
  # custom_intro_text is the body of the pre-attempt intro screen, shown only
  # while show_intro_screen is on; blank falls back to default text on the
  # frontend. Unlike instructions, it isn't shown during the attempt.
  serialized_attrs %w(
    time_limit_minutes
    show_correctness
    reveal_answer_explanation
    purpose
    custom_intro_text
    show_intro_screen
    allow_multiple_attempts
    max_attempts
    show_questions_after_submit
  )

  attr_accessor :serialized_placements

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

  def serializable_hash(options = nil)
    super.merge('placements' => placements.includes(:quiz_question).map(&:serializable_hash))
  end

  # Translates the key used in the .level file ("placements") to "serialized_placements",
  # which we use to differentiate between the file's data and placements derived from the association.
  def load_level_xml(xml_node)
    hash = super
    hash['serialized_placements'] = hash.delete('placements') if hash.key?('placements')
    hash
  end

  def import_serialized_placements!
    raise "quiz #{name.dump}: .level file is missing a placements list" if serialized_placements.nil?

    questions_by_key = QuizQuestion.where(key: serialized_placements.map {|entry| entry['question_key']}).index_by(&:key)

    desired = serialized_placements.map do |entry|
      question = questions_by_key[entry['question_key']]
      raise "quiz #{name.dump}: unknown question_key #{entry['question_key'].dump}" unless question
      {quiz_question_id: question.id, page: entry['page'], position: entry['position']}
    end

    existing = placements.map {|p| {quiz_question_id: p.quiz_question_id, page: p.page, position: p.position}}
    return if existing.sort_by {|h| h[:quiz_question_id]} == desired.sort_by {|h| h[:quiz_question_id]}

    # insert_all!/delete_all bypass QuizQuestionPlacement's callbacks, avoiding
    # the after commit hook that would otherwise circularly resave the quiz.
    placements.delete_all
    QuizQuestionPlacement.insert_all!(desired.map {|d| d.merge(level_id: id)}) if desired.any?
    placements.reset
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
  def clone_with_name(new_name, editor_experiment: nil)
    ActiveRecord::Base.transaction do
      level = super(new_name, editor_experiment: editor_experiment)
      placements.each do |placement|
        level.placements.create!(quiz_question: placement.quiz_question, page: placement.page, position: placement.position)
      end
      level
    end
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
        **question.attempt_content_json,
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
