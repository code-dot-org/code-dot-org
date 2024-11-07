class ChangePropertiesTypeToJSONInUserLevels < ActiveRecord::Migration[6.1]
  def up
    change_column :user_levels, :properties, :json, using: 'CAST(properties AS JSON)'
  end

  def down
    change_column :user_levels, :properties, :text
  end
end
