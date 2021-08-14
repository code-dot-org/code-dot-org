class SetupContainedLevels < ActiveRecord::Migration[5.2]
  def change
    Level.all.each(&:setup_contained_levels)
  end
end
