class RemoveAiTutorEnabledFromSections < ActiveRecord::Migration[7.0]
  def change
    remove_column :sections, :ai_tutor_enabled, :boolean, default: false
  end
end
