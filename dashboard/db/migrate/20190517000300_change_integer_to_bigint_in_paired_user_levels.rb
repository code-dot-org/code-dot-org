class ChangeIntegerToBigintInPairedUserLevels < ActiveRecord::Migration[5.0]
  def up
    change_column :paired_user_levels, :driver_user_level_id, 'BIGINT(11) UNSIGNED'
    change_column :paired_user_levels, :navigator_user_level_id, 'BIGINT(11) UNSIGNED'
  end

  def down
    change_column :paired_user_levels, :navigator_user_level_id, :integer
    change_column :paired_user_levels, :driver_user_level_id, :integer
  end
end
