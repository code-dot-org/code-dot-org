class AddAiTutorChallengeEnabledToSections < ActiveRecord::Migration[7.0]
  def change
    add_column :sections, :ai_tutor_enabled, :boolean, default: false, null: false
  end
end
