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

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated
  # objects are needed, then data from the seeding_keys of those objects should
  # be included as well. Ideally should correspond to a unique index for this
  # model's table. See comments on ScriptSeed.seed_from_json for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String>] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context)
    my_lesson = seed_context.lessons.select {|l| l.id == lesson_id}.first
    my_programming_expression = seed_context.programming_expressions.select {|pe| pe.id == programming_expression_id}.first
    my_programming_environment = seed_context.programming_environments.select {|pe| pe.id == my_programming_expression.programming_environment_id}.first
    {
      'lesson.key' => my_lesson.key,
      'programming_environment.name' => my_programming_environment.name,
      'programming_expression.key' => my_programming_expression.key
    }.stringify_keys
  end
end
