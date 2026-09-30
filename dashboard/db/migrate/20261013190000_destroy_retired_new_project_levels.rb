# Destroys the rows of six retired levels whose files have been deleted, in
# the long-running environments where levelbuilder_mode is enabled. A save
# from the level edit page there would write a level's file back into
# config/levels, where its "New ... Project" name breaks the production seed
# once standalone project levels are partitioned by name.
class DestroyRetiredNewProjectLevels < ActiveRecord::Migration[7.0]
  NAMES = [
    'New 2019 Sprite Lab Project',
    'New Bad Guys Sprite Lab Project',
    'New Mike Lab Project',
    'New Outbreak Project',
    'New PoemBot Project',
    'New Soccer Project',
  ].freeze

  def up
    return unless rack_env?(:levelbuilder, :development)

    Level.where(name: NAMES).find_each do |level|
      # Destroying a level also removes it from any unit that uses it.
      raise "#{level.name.dump} is in use by a unit or a parent level" if level.script_levels.exists? || level.parent_levels.exists?
      next if level.destroy
      raise "could not destroy #{level.name.dump}: #{level.errors.full_messages.to_sentence}"
    end
  end

  def down
  end
end
