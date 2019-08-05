class ChangeTeacherFeedbacksScriptLevel < ActiveRecord::Migration[5.0]
  def change
    change_column_null :teacher_feedbacks, :script_level_id, false
  end
end
