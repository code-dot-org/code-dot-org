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
end
