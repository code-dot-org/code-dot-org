class AddAiTeachingAssistantAvailableToCourseOfferings < ActiveRecord::Migration[6.1]
  def change
    add_column :course_offerings, :ai_teaching_assistant_available, :boolean, default: false, null: false
  end
end
