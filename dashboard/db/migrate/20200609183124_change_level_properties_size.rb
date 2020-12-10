class ChangeLevelPropertiesSize < ActiveRecord::Migration[5.0]
  def up
    change_column :levels, :properties, :text, limit: 16_777_215
  end

  def down
    change_column :levels, :properties, :text, limit: 65_535
  end
end
