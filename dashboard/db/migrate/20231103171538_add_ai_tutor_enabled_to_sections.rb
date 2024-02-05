class AddAiTutorEnabledToSections < ActiveRecord::Migration[6.1]
  def change
    add_column :sections, :ai_tutor_enabled, :boolean, default: false
  end
end
