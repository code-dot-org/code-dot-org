class AddAiAltTextToChallengeResponseAssets < ActiveRecord::Migration[6.1]
  def change
    add_column :challenge_response_assets, :ai_alt_text, :text
  end
end
