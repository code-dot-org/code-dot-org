class AddCourseKeyToLearningModules < ActiveRecord::Migration
  def change
    add_reference :learning_modules, :professional_learning_course, index: true, foreign_key: true
  end
end
