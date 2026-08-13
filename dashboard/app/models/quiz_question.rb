# == Schema Information
#
# Table name: quiz_questions
#
#  id            :bigint           not null, primary key
#  type          :string(255)      not null
#  question_key  :string(36)       not null
#  parent_id     :bigint
#  question_name :string(255)      not null
#  question      :json             not null
#  explanation   :text(65535)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_quiz_questions_on_parent_id     (parent_id)
#  index_quiz_questions_on_question_key  (question_key)
#
class QuizQuestion < ApplicationRecord
  # Rails only auto-populates the STI discriminator for actual subclasses;
  # the base class needs to set its own, since no subclasses exist yet and
  # every row today is a plain QuizQuestion.
  after_initialize {self.type ||= self.class.sti_name}

  belongs_to :parent, class_name: 'QuizQuestion', optional: true

  has_many :quiz_question_standards, dependent: :destroy
  has_many :standards, through: :quiz_question_standards

  has_many :quiz_level_questions
  has_many :levels, through: :quiz_level_questions

  validates :question_key, presence: true
  validates :question_name, presence: true
  validates :question, presence: true

  # Overridden by subtypes that can grade themselves server-side (currently
  # MultipleChoiceQuestion). Ungradable types are stored with
  # grading_status "ungraded" until manual/AI grading is built.
  def auto_gradable?
    false
  end

  # Shared by subtypes whose `question` includes a "choices" array (currently
  # MultipleChoiceQuestion and MultipleSelectQuestion). Returns the set of
  # choice ids, or nil (after recording an error on `question`) if the shape
  # is invalid.
  protected def validate_choices(choices)
    unless choices.is_a?(Array) && choices.length >= 2
      errors.add(:question, 'must have at least 2 "choices"')
      return nil
    end

    unless choices.all? {|c| c.is_a?(Hash) && c['id'].is_a?(String) && c['text'].is_a?(String)}
      errors.add(:question, 'each choice must have a string "id" and "text"')
      return nil
    end

    choice_ids = choices.map {|c| c['id']}
    unless choice_ids.uniq.length == choice_ids.length
      errors.add(:question, '"choices" ids must be unique')
      return nil
    end

    choice_ids
  end
end
