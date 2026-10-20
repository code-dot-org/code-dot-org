class AddApprovedToChallengeResponses < ActiveRecord::Migration[7.0]
  def change
    add_column :challenge_responses, :approved, :boolean, default: false, null: false
  end
end
