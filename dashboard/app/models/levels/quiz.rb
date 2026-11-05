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
  # custom_intro_text is the intro screen's body; unlike instructions, it
  # isn't shown during the attempt.
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

    write_placement_rows!(desired)
  end

  # Sets this quiz's placements to the given questions, in the order given,
  # with pages and positions renumbered from 1. Questions in delete_question_ids
  # are deleted if nothing else uses them, including ones never placed here.
  def replace_placements!(entries, delete_question_ids: [])
    new_question_ids = entries.pluck(:quiz_question_id)
    raise ArgumentError, 'a question is listed more than once' if new_question_ids.uniq.size != new_question_ids.size
    valid_question_ids = QuizQuestion.where(type: QuizQuestion::TYPES, id: new_question_ids).pluck(:id)
    raise ArgumentError, "unknown quiz question ids: #{(new_question_ids - valid_question_ids).sort.join(', ')}" if valid_question_ids.size != new_question_ids.size
    raise ArgumentError, "a question can't be both kept and deleted" if delete_question_ids.intersect?(new_question_ids)

    # Maps each page sent to 1..N in the same order, e.g. pages 4, 9 => {4 => 1, 9 => 2}.
    page_numbers = entries.pluck(:page).uniq.sort.each_with_index.to_h {|page, i| [page, i + 1]}
    # Counts positions per page.
    last_position_by_page = Hash.new(0)
    rows = entries.sort_by {|e| [e[:page], e[:position]]}.map do |entry|
      page = page_numbers[entry[:page]]
      {quiz_question_id: entry[:quiz_question_id], page: page, position: last_position_by_page[page] += 1}
    end

    transaction do
      write_placement_rows!(rows)
      QuizQuestion.where(id: delete_question_ids).find_each do |question|
        question.destroy! unless question.referenced?
      end
    end
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

  def saved_version
    updated_at.to_i
  end

  def advance_saved_version
    self.updated_at = Time.current.change(usec: 0)
  end

  # Whether a unit using this quiz is launched or sunsetting.
  def used_in_published_unit?
    script_levels.any? do |sl|
      unit = sl.script
      unit && (unit.launched? || unit.sunsetting?)
    end
  end

  def exam?
    purpose == 'exam'
  end

  def lock_level?
    script_levels.includes(lesson: :script_levels).any? do |script_level|
      script_level.lesson&.lockable && script_level.lesson.script_levels.last == script_level
    end
  end

  # An exam must be the last level of a lockable lesson, which is what makes
  # it teacher-released, and never a sublevel. Returns one message for each
  # current placement that breaks this, whatever this quiz's purpose.
  def exam_placement_problems
    problems = script_levels.includes(:script, lesson: :script_levels).filter_map do |sl|
      next unless sl.lesson
      place = "lesson \"#{sl.lesson.key}\" of unit \"#{sl.script&.name}\""
      if !sl.lesson.lockable
        "#{place} is not lockable"
      elsif sl.lesson.script_levels.last != sl
        "it is not the last level in #{place}"
      end
    end
    problems + parent_levels.map {|parent| "it is a sublevel of \"#{parent.name}\""}
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

  # Adds quiz questions to levelProperties without answer keys or
  # explanations, so grading stays server-side.
  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil, unit_group_unit: nil)
    properties_camelized = super
    properties_camelized[:scriptId] = script&.id
    # Placements, not questions, so each question carries its page; ordered
    # by page, then position.
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

  # delete_all/insert_all! skip the per-placement after_commit that rewrites the .level file.
  private def write_placement_rows!(rows)
    transaction do
      QuizQuestionPlacement.where(level_id: id).delete_all
      QuizQuestionPlacement.insert_all!(rows.map {|row| row.merge(level_id: id)}) if rows.any?
    end
    placements.reset
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

  # The intro screen is where a student learns there is a time limit.
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
