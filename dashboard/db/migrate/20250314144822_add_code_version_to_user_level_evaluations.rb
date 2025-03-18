class AddCodeVersionToUserLevelEvaluations < ActiveRecord::Migration[6.1]
  def change
    add_column :user_level_evaluations, :code_version, :string
  end
end
