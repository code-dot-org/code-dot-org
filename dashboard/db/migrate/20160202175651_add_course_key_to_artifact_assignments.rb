class AddCourseKeyToArtifactAssignments < ActiveRecord::Migration
  def change
    add_reference :artifact_assignments, :professional_learning_course, index: true, foreign_key: true
  end
end
