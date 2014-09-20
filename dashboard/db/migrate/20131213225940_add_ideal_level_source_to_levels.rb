class AddIdealLevelSourceToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :ideal_level_source_id, :integer
    Level.all.map do |level|
      best = Activity.where(level_id: level.id, test_result: 100).group(:level_source_id).max
      level.update_attributes(ideal_level_source_id: best.level_source.id) if best && best.level_source
    end
  end
end
