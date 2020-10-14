class DropValidatedUserLevels < ActiveRecord::Migration[5.0]
  def change
    drop_table :validated_user_levels
  end
end
