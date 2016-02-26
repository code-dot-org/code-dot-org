# == Schema Information
#
# Table name: plc_evaluation_questions
#
#  id            :integer          not null, primary key
#  question      :string(255)
#  plc_course_id :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_plc_evaluation_questions_on_plc_course_id  (plc_course_id)
#

class Plc::EvaluationQuestion < ActiveRecord::Base
  belongs_to :plc_course, class_name: '::Plc::Course'
  has_many :plc_evaluation_answers, class_name: '::Plc::EvaluationAnswer', foreign_key: 'plc_evaluation_question_id', dependent: :destroy

  #Helper method to make question creation easier, don't check this in
  def self.create_question_with_answers(plc_course, question, answers)
    new_question = Plc::EvaluationQuestion.create(plc_course: plc_course, question: question)
    answers.each do |answer, task|
      Plc::EvaluationAnswer.create(plc_evaluation_question: new_question, answer: answer, plc_task: task)
    end
  end
end
