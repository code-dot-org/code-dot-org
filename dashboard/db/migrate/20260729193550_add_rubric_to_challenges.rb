class AddRubricToChallenges < ActiveRecord::Migration[7.0]
  def change
    add_column :challenges, :rubric, :json
  end
end
