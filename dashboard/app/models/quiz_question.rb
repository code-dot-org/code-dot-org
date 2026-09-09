# == Schema Information
#
# Table name: quiz_questions
#
#  id             :bigint           not null, primary key
#  type           :string(255)      not null
#  key            :string(36)       not null
#  fork_parent_id :bigint
#  name           :string(255)      not null
#  content        :json             not null
#  explanation    :text(65535)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_quiz_questions_on_created_at  (created_at)
#  index_quiz_questions_on_key         (key)
#  index_quiz_questions_on_name        (name)
#
class QuizQuestion < ApplicationRecord
  after_initialize {self.type ||= self.class.sti_name}

  # No FK; parent delete leaves a dangling id.
  belongs_to :fork_parent, class_name: 'QuizQuestion', optional: true

  has_many :quiz_question_standards, dependent: :destroy
  has_many :standards, through: :quiz_question_standards

  has_many :placements, class_name: 'QuizQuestionPlacement', dependent: :destroy
  has_many :levels, through: :placements

  # No cascade. Destroy checks this (and other placements) before hard-delete.
  has_many :quiz_question_responses, dependent: nil

  validates :key, presence: true
  validates :name, presence: true
  validates :content, presence: true

  # published unit means preview/stable/sunsetting
  def used_in_published_unit?
    self.class.published_unit_usage([id]).fetch(id, false)
  end

  # Computes if group of question_ids are used in a published unit (see used_in_published_unit? for one question)
  # Returns {question_id => bool}; a question_id with no placements, or
  # none in a published unit, maps to false.
  def self.published_unit_usage(question_ids)
    return {} if question_ids.blank?

    placements = QuizQuestionPlacement.where(quiz_question_id: question_ids).
      includes(level: {script_levels: {script: :unit_group_units}})

    # Grouped by level, not iterated per placement - Unit#launched? calls
    # UnitGroup.get_from_cache (a separate id lookup, not covered by the
    # includes above), so per-placement would repeat it once per placement
    # on a shared level instead of once per unique level.
    question_ids_by_level = placements.group_by(&:level).transform_values {|ps| ps.map(&:quiz_question_id)}
    published_level_ids = question_ids_by_level.each_key.select do |level|
      level.script_levels.any? do |sl|
        unit = sl.script
        unit && (unit.launched? || unit.get_published_state == Curriculum::SharedCourseConstants::PUBLISHED_STATE.sunsetting)
      end
    end.to_set(&:id)

    usage = question_ids.index_with {false}
    question_ids_by_level.each do |level, ids|
      next unless published_level_ids.include?(level.id)
      ids.each {|id| usage[id] = true}
    end
    usage
  end

  # Overridden by subtypes that can grade themselves server-side
  # Auto-ungradable types are stored with grading_status "ungraded"
  # until manual/AI grading is built.
  def auto_gradable?
    false
  end

  # Shared by subtypes whose `content` includes a "choices" array. Returns
  # the set of choice ids, or nil (after recording an error on `content`) if
  # the shape is invalid.
  protected def validate_choices(choices)
    unless choices.is_a?(Array) && choices.length >= 2
      errors.add(:content, 'must have at least 2 "choices"')
      return nil
    end

    # id and text must both be non-blank, not just Strings - a blank text
    # would render as an answer choice with no visible label.
    unless choices.all? {|c| c.is_a?(Hash) && c['id'].is_a?(String) && c['id'].present? && c['text'].is_a?(String) && c['text'].present?}
      errors.add(:content, 'each choice must have a non-blank "id" and "text"')
      return nil
    end

    choice_ids = choices.map {|c| c['id']}
    unless choice_ids.uniq.length == choice_ids.length
      errors.add(:content, '"choices" ids must be unique')
      return nil
    end

    choice_ids
  end
end
