class RenameAiChallengeEnabledInSection < ActiveRecord::Migration[7.0]
  def change
    rename_column :sections, :ai_tutor_enabled, :ai_challenge_enabled
  end
end
