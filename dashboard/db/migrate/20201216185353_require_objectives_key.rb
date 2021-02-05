class RequireObjectivesKey < ActiveRecord::Migration[5.2]
  def up
    if [:development, :adhoc].include? rack_env
      Objective.where(key: nil).each do |objective|
        objective.update!(key: SecureRandom.uuid)
      end
    end
    change_column :objectives, :key, :string, null: false
  end

  def down
    change_column :objectives, :key, :string, null: true
  end
end
