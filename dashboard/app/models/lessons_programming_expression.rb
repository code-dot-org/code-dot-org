# == Schema Information
#
# Table name: lessons_programming_expressions
#
#  lesson_id                 :bigint           not null
#  programming_expression_id :bigint           not null
#
# Indexes
#
#  lesson_programming_expression  (lesson_id,programming_expression_id) UNIQUE
#  programming_expression_lesson  (programming_expression_id,lesson_id)
#
class LessonsProgrammingExpression < ApplicationRecord
  belongs_to :lesson
  belongs_to :programming_expression
end
