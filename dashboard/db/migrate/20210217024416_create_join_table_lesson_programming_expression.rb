class CreateJoinTableLessonProgrammingExpression < ActiveRecord::Migration[5.2]
  def change
    create_join_table :lessons, :programming_expressions do |t|
      t.index [:lesson_id, :programming_expression_id], unique: true, name: 'lesson_programming_expression'
      t.index [:programming_expression_id, :lesson_id], name: 'programming_expression_lesson'
    end
  end
end
